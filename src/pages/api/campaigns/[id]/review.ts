import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Fetch contacts for this campaign
        const { data: contacts, error: contactsError } = await supabase
            .from('contacts')
            .select('*')
            .eq('campaign_id', id)
            .order('id', { ascending: true });

        if (contactsError) {
            console.error('Contacts fetch error:', contactsError);
            throw contactsError;
        }

        console.log(`📧 Review API: Found ${contacts?.length || 0} contacts for campaign ${id}`);

        if (!contacts || contacts.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch all email variations for these contacts
        const contactIds = contacts.map(c => c.id);
        const { data: variations, error: variationsError } = await supabase
            .from('email_variations')
            .select('*')
            .in('contact_id', contactIds);

        if (variationsError) {
            console.error('Variations fetch error:', variationsError);
            throw variationsError;
        }

        console.log(`📧 Found ${variations?.length || 0} email variations`);

        // Join them manually
        const emailPreviews = contacts.map(contact => {
            const variation = variations?.find(v => v.contact_id === contact.id);
            console.log(`  - ${contact.first_name} ${contact.last_name}: ${variation ? 'Has email' : 'NO EMAIL'}`);

            return {
                id: `${contact.id}-${variation?.id || 'none'}`,
                contact: {
                    id: contact.id,
                    first_name: contact.first_name,
                    last_name: contact.last_name,
                    email: contact.email,
                    company: contact.company,
                    position: contact.position,
                    enrichment_data: contact.enrichment_data
                },
                variation: variation || {
                    id: null,
                    subject: 'No email generated',
                    body: 'No email content available'
                }
            };
        });

        console.log(`📊 Returning ${emailPreviews.length} email previews`);

        res.status(200).json(emailPreviews);

    } catch (error: any) {
        console.error('Review fetch error:', error);
        res.status(500).json({ error: error.message });
    }
}
