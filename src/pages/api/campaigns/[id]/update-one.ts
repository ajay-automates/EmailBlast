import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { variationId, subject, body } = req.body;

    if (!variationId || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Update the variation in database
        const { data: updatedVariation, error: updateError } = await supabase
            .from('email_variations')
            .update({
                subject: subject,
                body: body
            })
            .eq('id', variationId)
            .select()
            .single();

        if (updateError) throw updateError;

        res.status(200).json(updatedVariation);

    } catch (error: any) {
        console.error('Update email error:', error);
        res.status(500).json({ error: error.message });
    }
}
