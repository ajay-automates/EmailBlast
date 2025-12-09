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

    // Get email logs for this campaign
    const { data: logs, error: logsError } = await supabase
      .from('email_logs')
      .select('status')
      .eq('campaign_id', id)

    if (logsError) throw logsError

    const totalSent = logs?.length || 0
    const opened = logs?.filter(
      (l) => l.status === 'opened' || l.status === 'clicked'
    ).length || 0
    const clicked = logs?.filter((l) => l.status === 'clicked').length || 0
    const replied = logs?.filter((l) => l.status === 'replied').length || 0
    const bounced = logs?.filter((l) => l.status === 'bounced').length || 0

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
