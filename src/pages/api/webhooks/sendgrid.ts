import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const events = Array.isArray(req.body) ? req.body : [req.body]

    for (const event of events) {
      const messageId = event.sg_message_id

      if (!messageId) continue

      if (event.event === 'open') {
        await supabase
          .from('email_logs')
          .update({
            opened_at: new Date().toISOString(),
            status: 'opened',
          })
          .eq('sendgrid_message_id', messageId)
      }

      if (event.event === 'click') {
        await supabase
          .from('email_logs')
          .update({
            clicked_at: new Date().toISOString(),
            status: 'clicked',
          })
          .eq('sendgrid_message_id', messageId)
      }

      if (event.event === 'bounce') {
        await supabase
          .from('email_logs')
          .update({
            status: 'bounced',
          })
          .eq('sendgrid_message_id', messageId)
      }

      if (event.event === 'delivered') {
        await supabase
          .from('email_logs')
          .update({
            status: 'delivered',
          })
          .eq('sendgrid_message_id', messageId)
      }
    }

    res.json({ received: events.length })
  } catch (error: any) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: error.message })
  }
}
