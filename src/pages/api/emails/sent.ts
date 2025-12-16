import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const user = await getAuthUser(req)

        // 1. Fetch SENT logs
        const { data: sentLogs, error: sentError } = await supabase
            .from('email_logs')
            .select(`
        id, sent_at, status,
        contact:contacts (email, first_name, last_name, company, campaign:campaigns (name)),
        variation:email_variations (subject)
      `)
            .order('sent_at', { ascending: false })
            .limit(50)

        if (sentError) throw sentError

        // 2. Fetch SCHEDULED (Queue) items
        const { data: queueItems, error: queueError } = await supabase
            .from('send_queue')
            .select(`
        id, scheduled_for, status,
        contact:contacts (email, first_name, last_name, company, campaign:campaigns (name)),
        variation:email_variations (subject)
      `)
            .eq('status', 'pending')
            .order('scheduled_for', { ascending: true })
            .limit(50)

        if (queueError) throw queueError

        // 3. Transform & Combine
        const sent = (sentLogs || []).map((log: any) => ({
            id: log.id,
            sent_at: log.sent_at,
            status: log.status, // 'sent', 'bounced', etc
            recipient_email: log.contact?.email,
            recipient_name: `${log.contact?.first_name || ''} ${log.contact?.last_name || ''}`.trim(),
            company: log.contact?.company,
            campaign_name: log.contact?.campaign?.name || 'Unknown',
            subject: log.variation?.subject || '(No Subject)'
        }))

        const scheduled = (queueItems || []).map((item: any) => ({
            id: item.id,
            sent_at: item.scheduled_for, // Use scheduled time as 'sent_at' for display sorting
            status: 'scheduled', // Explicitly mark as scheduled
            recipient_email: item.contact?.email,
            recipient_name: `${item.contact?.first_name || ''} ${item.contact?.last_name || ''}`.trim(),
            company: item.contact?.company,
            campaign_name: item.contact?.campaign?.name || 'Unknown',
            subject: item.variation?.subject || '(No Subject)'
        }))

        // Combine and sort by date (Newest first)
        const allHistory = [...scheduled, ...sent].sort((a, b) =>
            new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
        )

        res.json(allHistory)

    } catch (error: any) {
        console.error('Fetch history error:', error)
        res.status(500).json({ error: error.message })
    }
}
