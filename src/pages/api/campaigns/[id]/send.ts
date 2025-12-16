import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import sgMail from '@sendgrid/mail'

export const config = {
  maxDuration: 300,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Set API key inside handler to ensure env vars are loaded
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({ error: 'SendGrid API key not configured' })
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const user = await getAuthUser(req)
    const { id } = req.query
    const { variationIds } = req.body

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid campaign ID' })
    }

    if (!variationIds || variationIds.length === 0) {
      return res.status(400).json({ error: 'No variations selected' })
    }

    // Get variations with contact info (exclude suppressed contacts)
    const { data: variations, error: variationsError } = await supabase
      .from('email_variations')
      .select(`
        *,
        contact:contact_id(id, email, first_name, last_name, replied, unsubscribed, bounced)
      `)
      .in('id', variationIds)

    if (variationsError || !variations || variations.length === 0) {
      return res.status(400).json({ error: 'No variations found' })
    }

    // Filter out suppressed contacts
    const validVariations = variations.filter((v: any) => {
      const contact = v.contact
      if (!contact) return false
      if (contact.replied) {
        console.log(`[Send] Skipping ${contact.email} - already replied`)
        return false
      }
      if (contact.unsubscribed) {
        console.log(`[Send] Skipping ${contact.email} - unsubscribed`)
        return false
      }
      if (contact.bounced) {
        console.log(`[Send] Skipping ${contact.email} - bounced`)
        return false
      }
      return true
    })

    if (validVariations.length === 0) {
      return res.status(400).json({
        error: 'All selected contacts are suppressed (replied/unsubscribed/bounced)',
        skipped: variations.length,
      })
    }

    // Validate SendGrid configuration
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({ error: 'SendGrid API key not configured' })
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      return res.status(500).json({ error: 'SendGrid sender email not configured' })
    }

    const sentIds: string[] = []
    const failedIds: string[] = []
    const skippedIds: string[] = []
    const errors: string[] = []

    // Track skipped contacts
    const skippedCount = variations.length - validVariations.length

    for (const variation of validVariations) {
      try {
        const contact = variation.contact as any

        // Get verified sender email from user profile or use default
        const senderEmail = process.env.SENDGRID_FROM_EMAIL

        // Generate unsubscribe link
        const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const unsubscribeLink = `${baseUrl}/api/unsubscribe/${contact.id}`

        // Inject unsubscribe link into email body
        const emailBody = variation.body + `\n\n---\n\nDon't want to receive these emails? Unsubscribe: ${unsubscribeLink}`
        const emailHtml = `<p>${variation.body.replace(/\n/g, '<br>')}</p><hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;"><p style="font-size: 12px; color: #718096;">Don't want to receive these emails? <a href="${unsubscribeLink}" style="color: #4299e1;">Unsubscribe</a></p>`

        const emailPayload = {
          personalizations: [{
            to: [{ email: contact.email }],
          }],
          from: { email: senderEmail },
          subject: variation.subject,
          content: [
            { type: 'text/plain', value: emailBody },
            { type: 'text/html', value: emailHtml }
          ],
          tracking_settings: {
            click_tracking: { enable: true },
            open_tracking: { enable: true },
          },
          custom_args: {
            'email_id': variation.id,
            'contact_id': contact.id,
          }
        }

        console.log(`[Send] Attempting to send from: '${senderEmail}' to '${contact.email}'`)
        console.log(`[Send] API Key length: ${process.env.SENDGRID_API_KEY?.length}`)
        console.log(`[Send] From email bytes:`, Buffer.from(senderEmail || '').toString('hex'))
        console.log(`[Send] Payload from:`, JSON.stringify(emailPayload.from))

        const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        })

        if (!sgResponse.ok) {
          const errorBody = await sgResponse.text()
          console.error('[Send] SendGrid error:', errorBody)
          throw new Error(`SendGrid error: ${errorBody}`)
        }

        const messageId = sgResponse.headers.get('x-message-id') || 'unknown'
        console.log(`[Send] Success! Message ID: ${messageId}`)

        // Log sent email
        const { error: logError } = await supabase
          .from('email_logs')
          .insert({
            variation_id: variation.id,
            contact_id: contact.id,
            sent_at: new Date().toISOString(),
            sendgrid_message_id: messageId,
            status: 'sent',
          })

        if (!logError) {
          sentIds.push(variation.id)
        } else {
          console.error('[Send] Log error:', logError)
          failedIds.push(variation.id)
          errors.push(`Failed to log email for ${contact.email}`)
        }
      } catch (error: any) {
        console.error('[Send] SendGrid error:', error.response?.body || error.message || error)
        failedIds.push(variation.id)
        const errorMsg = error.response?.body?.errors?.[0]?.message || error.message || 'Unknown error'
        errors.push(errorMsg)
      }
    }

    // Update campaign status to active if emails sent
    if (sentIds.length > 0) {
      await supabase
        .from('campaigns')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
    }

    res.json({
      sent: sentIds.length,
      failed: failedIds.length,
      skipped: skippedCount,
      message: `Sent ${sentIds.length} emails successfully${failedIds.length > 0 ? `, ${failedIds.length} failed` : ''}${skippedCount > 0 ? `, ${skippedCount} skipped (suppressed)` : ''}`,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Send emails error:', error)
    res.status(500).json({ error: error.message })
  }
}
