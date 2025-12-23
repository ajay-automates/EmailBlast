import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { industry, useCase } = req.query

        let query = supabase.from('email_templates').select('*')

        if (industry && industry !== 'all') {
            query = query.or(`industry.eq.${industry},industry.eq.All Industries`)
        }

        if (useCase) {
            query = query.eq('use_case', useCase)
        }

        const { data, error } = await query.order('industry')

        if (error) throw error

        return res.json({ templates: data })
    } catch (error: any) {
        console.error('[Templates] Error:', error)
        res.status(500).json({ error: 'Failed to fetch templates' })
    }
}
