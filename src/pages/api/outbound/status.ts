import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const user = session.user;

    // Check last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: runs, error } = await supabase
        .from('outbound_runs')
        .select('run_at, leads_valid')
        .eq('user_id', user.id)
        .gte('run_at', yesterday)
        .order('run_at', { ascending: false })
        .limit(1);

    if (error) return res.status(500).json({ error: error.message });

    const lastRun = runs?.[0];
    // UNLIMITED MODE: Always allow run
    const canRun = true;
    const timeUntilNext = null;

    res.status(200).json({
        canRun: true,
        lastRun,
        timeUntilNext: null,
        isPro: true
    });
}
