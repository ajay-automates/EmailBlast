import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

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
    const user = await getAuthUser(req)
    const { id } = req.query
    const { variationIds } = req.body

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid campaign ID' })
    }

    if (!variationIds || variationIds.length === 0) {
      return res.status(400).json({ error: 'No variations selected' })
    }

    // Get variations with contact info
    const { data: variations, error: variationsError } = await supabase
      .from('email_variations')
      .select(`
        *,
        contact:contact_id(id, email, first_name, last_name)
      `)
      .in('id', variationIds)

    if (variationsError || !variations || variations.length === 0) {
      return res.status(400).json({ error: 'No variations found' })
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
    const errors: string[] = []

    for (const variation of variations) {
      try {
        const contact = variation.contact as any

        // Get verified sender email from user profile or use default
        const senderEmail = process.env.SENDGRID_FROM_EMAIL

        const msg = {
          to: contact.email,
          from: senderEmail,
          subject: variation.subject,
          text: variation.body,
          html: `<p>${variation.body.replace(/\n/g, '<br>')}</p>`,
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true },
          },
          headers: {
            'X-Email-ID': variation.id,
          },
        }

        console.log(`[Send] Sending email to ${contact.email}...`)
        const [response] = await sgMail.send(msg)
        const messageId = response.headers['x-message-id']
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
      message: `Sent ${sentIds.length} emails successfully${failedIds.length > 0 ? `, ${failedIds.length} failed` : ''}`,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Send emails error:', error)
    res.status(500).json({ error: error.message })
  }
}
