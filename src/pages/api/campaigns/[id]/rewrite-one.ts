import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { AIEnrichmentService } from '@/lib/ai-enrichment';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;
    const { variationId, contactId } = req.body;

    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Fetch contact with enrichment data
        const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', contactId)
            .single();

        if (contactError) throw contactError;

        // Fetch campaign details for context
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (campaignError) throw campaignError;

        const enrichData = contact.enrichment_data as any;
        const valueProp = campaign.target_value_prop || 'our services';
        const industry = campaign.target_industry || 'your industry';
        const ctaLink = campaign.target_cta || '';

        // Generate new email with AI
        const prompt = `You are writing a personalized B2B cold email. Generate a DIFFERENT version than before.

RECIPIENT:
- Name: ${contact.first_name} ${contact.last_name}
- Title: ${contact.position}
- Company: ${contact.company}

RESEARCH:
- ${enrichData.icebreaker}
- ${enrichData.companyServices}
- Pain Points: ${enrichData.painPoints}
- ${enrichData.personalizedHook}

MY OFFER: ${valueProp}
CTA LINK: ${ctaLink}

Generate a NEW, DIFFERENT personalized email (subject + body). Keep it under 100 words, professional, and specific to their business.

IMPORTANT: You MUST sign off the email EXACTLY like this:
Best regards,
AJAY KUMAR REDDY NELAVETLA
8575761177

Return ONLY valid JSON:
{
    "subject": "...",
    "body": "..."
}`;

        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 400,
            messages: [{ role: 'user', content: prompt }]
        });

        const contentBlock = message.content[0];
        const text = contentBlock.type === 'text' ? contentBlock.text : '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error('Failed to generate email');

        const newEmail = JSON.parse(jsonMatch[0]);

        // Update the variation in database
        const { data: updatedVariation, error: updateError } = await supabase
            .from('email_variations')
            .update({
                subject: newEmail.subject,
                body: newEmail.body
            })
            .eq('id', variationId)
            .select()
            .single();

        if (updateError) throw updateError;

        res.status(200).json(updatedVariation);

    } catch (error: any) {
        console.error('Rewrite email error:', error);
        res.status(500).json({ error: error.message });
    }
}
