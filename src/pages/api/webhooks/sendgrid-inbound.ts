import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

/**
 * SendGrid Inbound Parse Webhook
 * 
 * This endpoint receives incoming email replies from SendGrid.
 * When someone replies to an outreach email, we:
 * 1. Mark the contact as "replied"
 * 2. Cancel all pending follow-ups
 * 3. Log the reply text
 * 
 * Setup in SendGrid:
 * Settings → Inbound Parse → Add Host & URL
 * URL: https://yourdomain.com/api/webhooks/sendgrid-inbound
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // SendGrid sends form data, not JSON
        const { to, from, subject, text, html } = req.body

        console.log('[Inbound] Reply received:', { to, from, subject })

        // Extract the original recipient email from the "to" field
        // This should match a contact in our database
        const recipientEmail = extractEmail(to)
        const senderEmail = extractEmail(from)

        if (!recipientEmail || !senderEmail) {
            console.error('[Inbound] Invalid email format')
            return res.status(400).json({ error: 'Invalid email format' })
        }

        // Find the contact who replied
        const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .select('id, campaign_id, first_name, email')
            .eq('email', senderEmail)
            .single()

        if (contactError || !contact) {
            console.log('[Inbound] Contact not found for:', senderEmail)
            // Not an error - could be a reply to a different email
            return res.json({ received: true, action: 'ignored' })
        }

        console.log('[Inbound] Found contact:', contact.id)

        // Mark contact as replied
        const { error: updateError } = await supabase
            .from('contacts')
            .update({ replied: true })
            .eq('id', contact.id)

        if (updateError) {
            console.error('[Inbound] Failed to update contact:', updateError)
            return res.status(500).json({ error: 'Failed to update contact' })
        }

        // Update email_logs with reply timestamp and text
        const { error: logError } = await supabase
            .from('email_logs')
            .update({
                replied_at: new Date().toISOString(),
                reply_text: text || html || subject,
                status: 'replied',
            })
            .eq('contact_id', contact.id)
            .is('replied_at', null) // Only update if not already marked

        if (logError) {
            console.error('[Inbound] Failed to update logs:', logError)
        }

        // Cancel all pending follow-ups for this contact
        const { error: cancelError } = await supabase
            .from('followups')
            .update({ status: 'cancelled' })
            .eq('contact_id', contact.id)
            .eq('status', 'scheduled')

        if (cancelError) {
            console.error('[Inbound] Failed to cancel follow-ups:', cancelError)
        }

        // Cancel any queued sends for this contact
        const { error: queueError } = await supabase
            .from('send_queue')
            .update({ status: 'cancelled' })
            .eq('contact_id', contact.id)
            .eq('status', 'pending')

        if (queueError) {
            console.error('[Inbound] Failed to cancel queue:', queueError)
        }

        console.log('[Inbound] ✅ Reply processed successfully for:', contact.email)

        res.json({
            received: true,
            action: 'processed',
            contact: contact.id,
            message: 'Reply logged and follow-ups cancelled',
        })
    } catch (error: any) {
        console.error('[Inbound] Error:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * Extract clean email address from SendGrid format
 * Input: "John Doe <john@example.com>" or "john@example.com"
 * Output: "john@example.com"
 */
function extractEmail(emailString: string): string | null {
    if (!emailString) return null

    const match = emailString.match(/<(.+?)>/)
    if (match && match[1]) {
        return match[1].toLowerCase().trim()
    }

    // Already clean format
    if (emailString.includes('@')) {
        return emailString.toLowerCase().trim()
    }

    return null
}

// Configure body parser for SendGrid's multipart/form-data
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
}
