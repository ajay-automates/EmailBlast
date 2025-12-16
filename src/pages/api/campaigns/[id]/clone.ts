import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

/**
 * Clone Campaign
 * 
 * Duplicates a campaign with all its settings.
 * Optionally clone contacts too for repeat outreach.
 * 
 * POST /api/campaigns/[id]/clone
 * Body: {
 *   name?: string,
 *   cloneContacts?: boolean
 * }
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const user = await getAuthUser(req)
        const { id } = req.query
        const { name, cloneContacts = false } = req.body

        if (typeof id !== 'string') {
            return res.status(400).json({ error: 'Invalid campaign ID' })
        }

        // Get original campaign
        const { data: original, error: fetchError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !original) {
            return res.status(404).json({ error: 'Campaign not found' })
        }

        // Create cloned campaign
        const clonedName = name || `${original.name} (Copy)`

        const { data: cloned, error: cloneError } = await supabase
            .from('campaigns')
            .insert({
                user_id: user.id,
                name: clonedName,
                subject_line: original.subject_line,
                context: original.context,
                ai_prompt: original.ai_prompt,
                tone: original.tone,
                daily_limit: original.daily_limit,
                status: 'draft',
            })
            .select()
            .single()

        if (cloneError || !cloned) {
            console.error('[Clone] Error creating campaign:', cloneError)
            return res.status(500).json({ error: 'Failed to clone campaign' })
        }

        console.log('[Clone] ✅ Campaign cloned:', cloned.id)

        // Optionally clone contacts
        let contactsCloned = 0
        if (cloneContacts) {
            const { data: contacts, error: contactsError } = await supabase
                .from('contacts')
                .select('*')
                .eq('campaign_id', id)

            if (!contactsError && contacts && contacts.length > 0) {
                const clonedContacts = contacts.map(contact => ({
                    campaign_id: cloned.id,
                    first_name: contact.first_name,
                    last_name: contact.last_name,
                    email: contact.email,
                    company: contact.company,
                    position: contact.position,
                    // Reset status flags
                    replied: false,
                    unsubscribed: false,
                    bounced: false,
                }))

                const { error: insertError } = await supabase
                    .from('contacts')
                    .insert(clonedContacts)

                if (!insertError) {
                    contactsCloned = clonedContacts.length
                    console.log(`[Clone] ✅ Cloned ${contactsCloned} contacts`)
                }
            }
        }

        res.json({
            id: cloned.id,
            name: cloned.name,
            contactsCloned,
            message: `Campaign cloned successfully${contactsCloned > 0 ? ` with ${contactsCloned} contacts` : ''}`,
        })
    } catch (error: any) {
        console.error('[Clone] Error:', error)
        res.status(500).json({ error: error.message })
    }
}
