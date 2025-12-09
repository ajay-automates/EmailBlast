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

        // Fetch sent logs with related data
        // Supabase inner joins via key mapping
        const { data: logs, error } = await supabase
            .from('email_logs')
            .select(`
        *,
        contact:contact_id(email, first_name, last_name, company),
        variation:variation_id(subject, body),
        contact_id,
        variation_id
      `)
            .order('sent_at', { ascending: false })
            .limit(100)

        if (error) throw error

        // To get campaign name, we might need a separate query or deeper join if not directly related to log
        // email_logs -> contacts -> campaign
        // But currently supabase-js deep join limit might be tricky or structure dependent.
        // Let's see if we can get campaign_id via contact.

        // Better query:
        // email_logs -> contact (has campaign_id) -> campaign (name)
        // Supabase supports nested select:
        // contact:contacts(..., campaign:campaigns(name))

        const { data: richLogs, error: richError } = await supabase
            .from('email_logs')
            .select(`
        id,
        sent_at,
        status,
        contact:contacts (
          email,
          first_name,
          last_name,
          company,
          campaign:campaigns (
            name
          )
        ),
        variation:email_variations (
          subject
        )
      `)
            .order('sent_at', { ascending: false })
            .limit(50)

        if (richError) throw richError

        // Transform flattening for easier frontend use
        const flatLogs = richLogs.map((log: any) => ({
            id: log.id,
            sent_at: log.sent_at,
            status: log.status,
            recipient_email: log.contact?.email,
            recipient_name: `${log.contact?.first_name || ''} ${log.contact?.last_name || ''}`.trim(),
            company: log.contact?.company,
            campaign_name: log.contact?.campaign?.name || 'Unknown',
            subject: log.variation?.subject || '(No Subject)'
        }))

        res.json(flatLogs)
    } catch (error: any) {
        console.error('Fetch sent emails error:', error)
        res.status(500).json({ error: error.message })
    }
}
