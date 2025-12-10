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
    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid campaign ID' })
    }

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return res.status(403).json({ error: 'Campaign not found or unauthorized' })
    }

    // Get all contacts for this campaign first
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id')
      .eq('campaign_id', id)

    if (contactsError) throw contactsError

    const contactIds = contacts?.map(c => c.id) || []

    // Get email logs for these contacts
    let logs: any[] = []
    if (contactIds.length > 0) {
      const { data: logsData, error: logsError } = await supabase
        .from('email_logs')
        .select('status')
        .in('contact_id', contactIds)

      if (logsError) throw logsError
      logs = logsData || []
    }

    const totalSent = logs.length
    const opened = logs.filter(
      (l) => l.status === 'opened' || l.status === 'clicked'
    ).length
    const clicked = logs.filter((l) => l.status === 'clicked').length
    const replied = logs.filter((l) => l.status === 'replied').length
    const bounced = logs.filter((l) => l.status === 'bounced').length

    const openRate = totalSent > 0 ? ((opened / totalSent) * 100).toFixed(1) : '0.0'
    const clickRate = totalSent > 0 ? ((clicked / totalSent) * 100).toFixed(1) : '0.0'
    const replyRate = totalSent > 0 ? ((replied / totalSent) * 100).toFixed(1) : '0.0'
    const bounceRate = totalSent > 0 ? ((bounced / totalSent) * 100).toFixed(1) : '0.0'

    res.json({
      totalSent,
      opened,
      clicked,
      replied,
      bounced,
      openRate: `${openRate}%`,
      clickRate: `${clickRate}%`,
      replyRate: `${replyRate}%`,
      bounceRate: `${bounceRate}%`,
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    res.status(500).json({ error: error.message })
  }
}
