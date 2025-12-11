import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    if (req.method === 'GET') {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, name, company, plan, created_at')
                .eq('id', userId)
                .single();

            if (error) {
                return res.status(500).json({ error: 'Failed to fetch profile' });
            }

            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { name, company } = req.body;

            const { data, error } = await supabase
                .from('users')
                .update({
                    name,
                    company,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                return res.status(500).json({ error: 'Failed to update profile' });
            }

            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
