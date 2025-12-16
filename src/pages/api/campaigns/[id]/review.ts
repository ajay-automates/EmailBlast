import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Fetch all contacts and their email variations for this campaign
        const { data: contacts, error: contactsError } = await supabase
            .from('contacts')
            .select(`
                id,
                first_name,
                last_name,
                email,
                company,
                position,
                enrichment_data,
                email_variations (
                    id,
                    subject,
                    body,
                    variation_number
                )
            `)
            .eq('campaign_id', id)
            .order('id', { ascending: true });

        if (contactsError) throw contactsError;

        console.log(`📧 Review API: Found ${contacts?.length || 0} contacts for campaign ${id}`);

        // Transform into review format
        const emailPreviews = contacts?.map(contact => {
            console.log(`  - Contact: ${contact.first_name} ${contact.last_name}, Variations: ${contact.email_variations?.length || 0}`);
            return {
                id: `${contact.id}-${contact.email_variations?.[0]?.id}`,
                contact: {
                    id: contact.id,
                    first_name: contact.first_name,
                    last_name: contact.last_name,
                    email: contact.email,
                    company: contact.company,
                    position: contact.position,
                    enrichment_data: contact.enrichment_data
                },
                variation: contact.email_variations?.[0] || {
                    id: null,
                    subject: 'No email generated',
                    body: 'No email content available'
                }
            };
        }) || [];

        console.log(`📊 Returning ${emailPreviews.length} email previews`);

        res.status(200).json(emailPreviews);

    } catch (error: any) {
        console.error('Review fetch error:', error);
        res.status(500).json({ error: error.message });
    }
}
