import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;
    const { variationId, contactId, scheduleTime } = req.body;

    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Parse schedule time (simple implementation - you can enhance this)
        let scheduledFor = new Date();

        if (scheduleTime.includes('hour')) {
            const hours = parseInt(scheduleTime);
            scheduledFor = new Date(Date.now() + hours * 60 * 60 * 1000);
        } else if (scheduleTime.includes('tomorrow')) {
            scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);
            scheduledFor.setHours(9, 0, 0, 0); // 9 AM tomorrow
        } else {
            // Default to 1 hour from now
            scheduledFor = new Date(Date.now() + 60 * 60 * 1000);
        }

        // Add to send queue
        const { error: queueError } = await supabase
            .from('send_queue')
            .insert({
                campaign_id: id,
                variation_id: variationId,
                contact_id: contactId,
                scheduled_for: scheduledFor.toISOString(),
                status: 'pending'
            });

        if (queueError) throw queueError;

        res.status(200).json({
            success: true,
            message: 'Email scheduled',
            scheduledFor: scheduledFor.toISOString()
        });

    } catch (error: any) {
        console.error('Schedule email error:', error);
        res.status(500).json({ error: error.message });
    }
}
