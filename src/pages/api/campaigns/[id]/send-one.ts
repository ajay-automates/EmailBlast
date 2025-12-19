import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;
    const { variationId, contactId } = req.body;

    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Fetch contact details
        const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', contactId)
            .single();

        if (contactError) throw contactError;

        // Fetch email variation
        const { data: variation, error: varError } = await supabase
            .from('email_variations')
            .select('*')
            .eq('id', variationId)
            .single();

        if (varError) throw varError;

        // Get user's sender email from settings
        const { data: userData } = await supabase
            .from('users')
            .select('email')
            .eq('id', session.user.id)
            .single();

        const fromEmail = userData?.email || session.user.email;

        // Use SendGrid verified sender for 'from', user email for 'replyTo'
        const senderEmail = process.env.SENDGRID_FROM_EMAIL || fromEmail;

        // Send via SendGrid
        const msg = {
            to: contact.email,
            from: senderEmail,
            replyTo: fromEmail, // Replies go to the user
            subject: variation.subject,
            text: variation.body,
            html: variation.body.replace(/\n/g, '<br>')
        };

        await sgMail.send(msg);

        // Log the send
        await supabase.from('email_logs').insert({
            contact_id: contactId,
            variation_id: variationId,
            sent_at: new Date().toISOString(),
            status: 'sent'
        });

        res.status(200).json({ success: true, message: 'Email sent successfully' });

    } catch (error: any) {
        console.error('Send email error:', error);
        res.status(500).json({ error: error.message || 'Failed to send email' });
    }
}
