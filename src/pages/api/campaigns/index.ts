import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await getAuthUser(req)

    if (req.method === 'GET') {
      // Get all campaigns for user
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.json(data)
    }

    if (req.method === 'POST') {
      // Create new campaign
      const { name, subjectLine, context } = req.body

      if (!name) {
        return res.status(400).json({ error: 'Campaign name required' })
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          name,
          subject_line: subjectLine || '',
          context: context || '',
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error
      return res.json(data)
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Campaign error:', error)
    res.status(500).json({ error: error.message })
  }
}
