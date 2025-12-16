import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import sgMail from '@sendgrid/mail'

/**
 * Email Preview & Test Send
 * 
 * GET /api/campaigns/[id]/preview?contactId=xxx
 * - Preview email for a specific contact
 * 
 * POST /api/campaigns/[id]/preview
 * Body: { contactId: string, sendTest?: boolean, testEmail?: string }
 * - Send test email to yourself
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const user = await getAuthUser(req)
        const { id } = req.query

        if (typeof id !== 'string') {
            return res.status(400).json({ error: 'Invalid campaign ID' })
        }

        // GET: Preview email
        if (req.method === 'GET') {
            const { contactId } = req.query

            if (typeof contactId !== 'string') {
                return res.status(400).json({ error: 'Contact ID required' })
            }

            // Get variation for this contact
            const { data: variation, error } = await supabase
                .from('email_variations')
                .select(`
          *,
          contact:contact_id(*)
        `)
                .eq('contact_id', contactId)
                .limit(1)
                .single()

            if (error || !variation) {
                return res.status(404).json({ error: 'No email generated for this contact yet' })
            }

            const contact = variation.contact as any

            // Generate unsubscribe link
            const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
            const unsubscribeLink = `${baseUrl}/api/unsubscribe/${contact.id}`

            // Add unsubscribe footer
            const emailBody = variation.body + `\n\n---\n\nDon't want to receive these emails? Unsubscribe: ${unsubscribeLink}`
            const emailHtml = `<p>${variation.body.replace(/\n/g, '<br>')}</p><hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;"><p style="font-size: 12px; color: #718096;">Don't want to receive these emails? <a href="${unsubscribeLink}" style="color: #4299e1;">Unsubscribe</a></p>`

            return res.json({
                contact: {
                    email: contact.email,
                    firstName: contact.first_name,
                    lastName: contact.last_name,
                    company: contact.company,
                },
                subject: variation.subject,
                bodyText: emailBody,
                bodyHtml: emailHtml,
            })
        }

        // POST: Send test email
        if (req.method === 'POST') {
            const { contactId, sendTest, testEmail } = req.body

            if (!sendTest) {
                return res.status(400).json({ error: 'sendTest must be true' })
            }

            if (!testEmail) {
                return res.status(400).json({ error: 'testEmail required' })
            }

            if (typeof contactId !== 'string') {
                return res.status(400).json({ error: 'Contact ID required' })
            }

            // Get variation
            const { data: variation, error } = await supabase
                .from('email_variations')
                .select(`
          *,
          contact:contact_id(*)
        `)
                .eq('contact_id', contactId)
                .limit(1)
                .single()

            if (error || !variation) {
                return res.status(404).json({ error: 'No email generated for this contact yet' })
            }

            const contact = variation.contact as any

            // Set SendGrid API key
            if (!process.env.SENDGRID_API_KEY) {
                return res.status(500).json({ error: 'SendGrid not configured' })
            }
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)

            // Generate unsubscribe link
            const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
            const unsubscribeLink = `${baseUrl}/api/unsubscribe/${contact.id}`

            // Add test email banner and unsubscribe
            const emailBody = `[TEST EMAIL - Would be sent to: ${contact.email}]\n\n${variation.body}\n\n---\n\nDon't want to receive these emails? Unsubscribe: ${unsubscribeLink}`
            const emailHtml = `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px;">
          <strong>🧪 TEST EMAIL</strong><br>
          This would be sent to: <strong>${contact.email}</strong>
        </div>
        <p>${variation.body.replace(/\n/g, '<br>')}</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #718096;">
          Don't want to receive these emails? <a href="${unsubscribeLink}" style="color: #4299e1;">Unsubscribe</a>
        </p>
      `

            const emailPayload = {
                personalizations: [{
                    to: [{ email: testEmail }],
                }],
                from: { email: process.env.SENDGRID_FROM_EMAIL },
                subject: `[TEST] ${variation.subject}`,
                content: [
                    { type: 'text/plain', value: emailBody },
                    { type: 'text/html', value: emailHtml }
                ],
            }

            console.log(`[Preview] Sending test email to ${testEmail}`)

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
                console.error('[Preview] SendGrid error:', errorBody)
                return res.status(500).json({ error: 'Failed to send test email' })
            }

            console.log(`[Preview] ✅ Test email sent to ${testEmail}`)

            return res.json({
                sent: true,
                to: testEmail,
                message: 'Test email sent successfully',
            })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error: any) {
        console.error('[Preview] Error:', error)
        res.status(500).json({ error: error.message })
    }
}
