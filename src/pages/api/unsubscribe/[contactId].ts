import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

/**
 * Public Unsubscribe Endpoint
 * 
 * One-click unsubscribe for email recipients.
 * This is a legal requirement for cold email and protects your domain reputation.
 * 
 * Usage: https://yourdomain.com/api/unsubscribe/[contactId]
 * 
 * This link is automatically injected into every email footer.
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { contactId } = req.query

    if (typeof contactId !== 'string') {
        return res.status(400).send('Invalid contact ID')
    }

    try {
        // Mark contact as unsubscribed
        const { data: contact, error } = await supabase
            .from('contacts')
            .update({ unsubscribed: true })
            .eq('id', contactId)
            .select('email, first_name')
            .single()

        if (error || !contact) {
            console.error('[Unsubscribe] Error:', error)
            return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Unsubscribe - Error</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                max-width: 600px;
                margin: 100px auto;
                padding: 40px;
                text-align: center;
                background: #f5f5f5;
              }
              .card {
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              h1 { color: #e74c3c; margin-bottom: 16px; }
              p { color: #666; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>❌ Error</h1>
              <p>We couldn't find this contact in our system.</p>
              <p>You may have already been unsubscribed, or the link is invalid.</p>
            </div>
          </body>
        </html>
      `)
        }

        // Cancel all pending sends and follow-ups
        await supabase
            .from('send_queue')
            .update({ status: 'cancelled' })
            .eq('contact_id', contactId)
            .eq('status', 'pending')

        await supabase
            .from('followups')
            .update({ status: 'cancelled' })
            .eq('contact_id', contactId)
            .eq('status', 'scheduled')

        console.log('[Unsubscribe] ✅ Contact unsubscribed:', contact.email)

        // Show success page
        res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed Successfully</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 100px auto;
              padding: 40px 20px;
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .card {
              background: white;
              padding: 48px 40px;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .icon {
              font-size: 64px;
              margin-bottom: 24px;
            }
            h1 {
              color: #2d3748;
              margin-bottom: 16px;
              font-size: 28px;
            }
            p {
              color: #718096;
              line-height: 1.8;
              font-size: 16px;
              margin-bottom: 12px;
            }
            .email {
              background: #f7fafc;
              padding: 12px 20px;
              border-radius: 6px;
              color: #4a5568;
              font-weight: 600;
              margin: 24px 0;
            }
            .note {
              font-size: 14px;
              color: #a0aec0;
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h1>You've Been Unsubscribed</h1>
            <p>We've removed you from our email list.</p>
            <div class="email">${contact.email}</div>
            <p>You won't receive any more emails from us.</p>
            <p class="note">
              If this was a mistake, please contact us directly.<br>
              We respect your inbox and your time.
            </p>
          </div>
        </body>
      </html>
    `)
    } catch (error: any) {
        console.error('[Unsubscribe] Error:', error)
        res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribe - Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              max-width: 600px;
              margin: 100px auto;
              padding: 40px;
              text-align: center;
              background: #f5f5f5;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #e74c3c; margin-bottom: 16px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>❌ Something Went Wrong</h1>
            <p>We encountered an error processing your request.</p>
            <p>Please try again or contact support.</p>
          </div>
        </body>
      </html>
    `)
    }
}
