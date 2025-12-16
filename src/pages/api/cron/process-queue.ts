import { NextApiRequest, NextApiResponse } from 'next'
import { getPendingEmails, markAsSent, markAsFailed } from '@/lib/send-queue'
import sgMail from '@sendgrid/mail'

/**
 * Cron Job: Process Send Queue
 * 
 * This endpoint should be called every 15 minutes by a cron service.
 * It processes pending emails from the queue and sends them via SendGrid.
 * 
 * Setup with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-queue",
 *     "schedule": "0 12 * * *"
    *   }]
 * }
 * 
 * Or use external cron service(cron - job.org, EasyCron):
 * URL: https://yourdomain.com/api/cron/process-queue
 * Schedule: Every 15 minutes
    * 
 * Security: Verify cron secret to prevent unauthorized access
    */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Verify cron secret (optional but recommended)
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        console.log('[Cron] Starting queue processing...')

        // Get up to 10 pending emails
        const pending = await getPendingEmails(10)

        if (pending.length === 0) {
            console.log('[Cron] No pending emails')
            return res.json({ processed: 0, message: 'No pending emails' })
        }

        console.log(`[Cron] Found ${pending.length} emails to send`)

        // Set SendGrid API key
        if (!process.env.SENDGRID_API_KEY) {
            console.error('[Cron] SendGrid API key not configured')
            return res.status(500).json({ error: 'SendGrid not configured' })
        }
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)

        const results = {
            sent: 0,
            failed: 0,
            skipped: 0,
        }

        for (const item of pending) {
            try {
                const { id: queueId, variation, contact, campaign } = item

                // Skip if contact is suppressed
                if (contact.replied || contact.unsubscribed || contact.bounced) {
                    console.log(`[Cron] Skipping ${contact.email} - suppressed`)
                    await markAsFailed(queueId, 'Contact suppressed')
                    results.skipped++
                    continue
                }

                // Generate unsubscribe link
                const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
                const unsubscribeLink = `${baseUrl}/api/unsubscribe/${contact.id}`

                // Inject unsubscribe link
                const emailBody = variation.body + `\n\n---\n\nDon't want to receive these emails? Unsubscribe: ${unsubscribeLink}`
                const emailHtml = `<p>${variation.body.replace(/\n/g, '<br>')}</p><hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;"><p style="font-size: 12px; color: #718096;">Don't want to receive these emails? <a href="${unsubscribeLink}" style="color: #4299e1;">Unsubscribe</a></p>`

                const emailPayload = {
                    personalizations: [{
                        to: [{ email: contact.email }],
                    }],
                    from: { email: process.env.SENDGRID_FROM_EMAIL },
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
                        'queue_id': queueId,
                    }
                }

                console.log(`[Cron] Sending to ${contact.email}...`)

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
                    console.error('[Cron] SendGrid error:', errorBody)
                    throw new Error(`SendGrid error: ${errorBody}`)
                }

                const messageId = sgResponse.headers.get('x-message-id') || 'unknown'
                console.log(`[Cron] ✅ Sent to ${contact.email}, message ID: ${messageId}`)

                // Log sent email
                const { supabase } = await import('@/lib/supabase')
                await supabase.from('email_logs').insert({
                    variation_id: variation.id,
                    contact_id: contact.id,
                    sent_at: new Date().toISOString(),
                    sendgrid_message_id: messageId,
                    status: 'sent',
                })

                // Mark as sent in queue
                await markAsSent(queueId, messageId)
                results.sent++

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000))

            } catch (error: any) {
                console.error('[Cron] Error sending email:', error.message)
                await markAsFailed(item.id, error.message)
                results.failed++
            }
        }

        console.log(`[Cron] ✅ Complete: ${results.sent} sent, ${results.failed} failed, ${results.skipped} skipped`)

        res.json({
            processed: pending.length,
            sent: results.sent,
            failed: results.failed,
            skipped: results.skipped,
            message: `Processed ${pending.length} emails`,
        })
    } catch (error: any) {
        console.error('[Cron] Error:', error)
        res.status(500).json({ error: error.message })
    }
}

// Increase timeout for cron job
export const config = {
    maxDuration: 300, // 5 minutes
}
