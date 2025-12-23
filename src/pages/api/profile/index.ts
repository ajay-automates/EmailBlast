import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const user = await getAuthUser(req, res)

        if (req.method === 'GET') {
            // Fetch user's company profile
            const { data: profile, error } = await supabase
                .from('company_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                throw error
            }

            return res.json({ profile: profile || null })
        }

        if (req.method === 'POST') {
            // Create or update company profile
            const body = req.body

            const profileData = {
                user_id: user.id,
                company_name: body.companyName,
                website_url: body.websiteUrl,
                industry: body.industry,
                company_size: body.companySize,
                sender_name: body.senderName,
                sender_title: body.senderTitle,
                sender_email: body.senderEmail,
                sender_phone: body.senderPhone,
                sender_linkedin: body.senderLinkedin,
                tagline: body.tagline,
                description: body.description,
                services: body.services,
                unique_value_proposition: body.uniqueValueProposition,
                target_audience: body.targetAudience,
                key_results: body.keyResults,
                testimonials: body.testimonials,
                tone: body.tone,
                call_to_action: body.callToAction,
                calendar_link: body.calendarLink,
                updated_at: new Date().toISOString(),
            }

            const { data, error } = await supabase
                .from('company_profiles')
                .upsert(profileData, { onConflict: 'user_id' })
                .select()
                .single()

            if (error) throw error

            return res.json({ profile: data, message: 'Profile saved successfully' })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error: any) {
        console.error('[Profile] Error:', error)
        res.status(500).json({ error: error.message })
    }
}
