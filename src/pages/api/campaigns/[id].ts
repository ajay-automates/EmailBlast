import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

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

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return res.status(403).json({ error: 'Campaign not found or unauthorized' })
    }

    if (req.method === 'GET') {
      return res.json(campaign)
    }

    if (req.method === 'PUT') {
      const { name, subjectLine, context, status } = req.body
      const updateData: any = {}

      if (name !== undefined) updateData.name = name
      if (subjectLine !== undefined) updateData.subject_line = subjectLine
      if (context !== undefined) updateData.context = context
      if (status !== undefined) updateData.status = status
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return res.json(data)
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)

      if (error) throw error
      return res.json({ success: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Campaign detail error:', error)
    res.status(500).json({ error: error.message })
  }
}
