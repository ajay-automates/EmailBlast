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
        const user = await getAuthUser(req, res)
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

        // Get all contacts for this campaign
        const { data: contacts, error: contactsError } = await supabase
            .from('contacts')
            .select('id')
            .eq('campaign_id', id)

        if (contactsError) {
            return res.status(500).json({ error: 'Failed to fetch contacts' })
        }

        const contactIds = contacts?.map(c => c.id) || []

        if (contactIds.length === 0) {
            return res.json([])
        }

        // Get all email variations for these contacts with contact details
        const { data: variations, error: variationsError } = await supabase
            .from('email_variations')
            .select(`
        id,
        variation_number,
        subject,
        body,
        contact_id,
        contacts (
          id,
          first_name,
          last_name,
          email
        )
      `)
            .in('contact_id', contactIds)
            .order('contact_id')
            .order('variation_number')

        if (variationsError) {
            console.error('Error fetching variations:', variationsError)
            return res.status(500).json({ error: 'Failed to fetch variations' })
        }

        // Transform the data to match the frontend interface
        const transformedVariations = variations?.map(v => ({
            id: v.id,
            variation_number: v.variation_number,
            subject: v.subject,
            body: v.body,
            contact: {
                id: (v.contacts as any)?.id,
                first_name: (v.contacts as any)?.first_name,
                last_name: (v.contacts as any)?.last_name,
                email: (v.contacts as any)?.email,
            }
        })) || []

        res.json(transformedVariations)
    } catch (error: any) {
        console.error('Error in variations endpoint:', error)
        res.status(500).json({ error: error.message })
    }
}
