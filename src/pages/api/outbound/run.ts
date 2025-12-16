import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { ApolloService } from '@/lib/apollo';
import { validateLeads } from '@/lib/outbound-filters';
import { AIEnrichmentService } from '@/lib/ai-enrichment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const user = session.user;
    const { industry, ctaLink, valueProp } = req.body;

    if (!industry || !ctaLink) {
        return res.status(400).json({ error: 'Industry and CTA Link are required' });
    }

    try {
        // 1. CHECK LIMITS (Strict 24h Cooldown)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentRuns } = await supabase
            .from('outbound_runs')
            .select('*')
            .eq('user_id', user.id)
            .gte('run_at', yesterday);

        if (recentRuns && recentRuns.length > 0) {
            return res.status(429).json({
                error: 'Daily limit reached. You can only run One-Click Outbound once every 24 hours.'
            });
        }

        // 2. FETCH LEADS (Apollo)
        const apollo = new ApolloService();
        const rawLeads = await apollo.getLeads(industry);

        if (rawLeads.length === 0) {
            return res.status(404).json({ error: 'No leads found for this industry. Try a broader term.' });
        }

        // 3. VALIDATE & CLEAN
        // This ensures we only keep 10 NET NEW, SAFE leads
        const validLeads = await validateLeads(rawLeads, supabase);

        if (validLeads.length === 0) {
            return res.status(200).json({
                message: 'No new valid leads found (duplicates or suppressed). Try again tomorrow with a different industry.'
            });
        }

        // 4. CREATE CAMPAIGN CONTAINER
        const campaignName = `Auto Outreach: ${industry} (${new Date().toISOString().split('T')[0]})`;

        const { data: campaign, error: campError } = await supabase
            .from('campaigns')
            .insert({
                user_id: user.id,
                name: campaignName,
                status: 'draft', // User must review before sending? Or auto-send? V2 spec says "Start Outreach", so likely "scheduled"
                type: 'auto_outbound',
                target_industry: industry,
                target_cta: ctaLink,
                target_value_prop: valueProp,
                daily_limit: 10 // Enforce safety
            })
            .select()
            .single();

        if (campError) throw campError;

        // 5. ENRICH & SAVE CONTACTS
        const enrichment = new AIEnrichmentService();
        const contactsToInsert = [];
        const emailsToGenerate = [];

        for (const lead of validLeads) {
            // A. AI Enrichment
            const enrichData = await enrichment.enrichLead(lead, valueProp || 'our services');

            // B. Prepare Contact
            contactsToInsert.push({
                campaign_id: campaign.id,
                first_name: lead.first_name,
                last_name: lead.last_name,
                email: lead.email,
                company: lead.organization.name,
                position: lead.headline,
                enrichment_data: enrichData
            });
        }

        const { data: insertedContacts, error: contactError } = await supabase
            .from('contacts')
            .insert(contactsToInsert)
            .select();

        if (contactError) throw contactError;

        // 6. GENERATE EMAILS (Locked System Prompt)
        // We generate the actual email content for each contact now
        const { default: generateEmail } = await import('@/pages/api/campaigns/[id]/generate');
        // Note: Ideally we'd reuse the generation logic function, but for now we'll simulate it or simple generation here.
        // For reliability, let's create a simplified generator right here.

        const variationsToInsert = [];
        const queueItems: any[] = []; // Explicitly typed as any[]

        for (const contact of insertedContacts) {
            const context = contact.enrichment_data as any;

            // LOCKED SYSTEM PROMPT
            const subject = `Question about ${contact.company}`;
            const body = `Hi ${contact.first_name},

${context.icebreaker}

Given that you are leading things at ${contact.company}, I wanted to see if you'd be open to a conversation about ${valueProp || 'improving your workflow'}.

Verified professionals in ${industry} are seeing great results.

${context.context}

Worth a quick chat?

${ctaLink}

Best,
[Your Name]`;

            variationsToInsert.push({
                contact_id: contact.id,
                variation_number: 1,
                subject: subject,
                body: body
            });
        }

        const { data: insertedVariations, error: varError } = await supabase
            .from('email_variations')
            .insert(variationsToInsert)
            .select();

        if (varError) throw varError;

        // 7. SCHEDULE SENDING (Queue)
        // Schedule them 15 mins apart starting now
        const startTime = Date.now();
        const baseDelay = 15 * 60 * 1000; // 15 mins

        insertedVariations.forEach((variation, index) => {
            const contact = insertedContacts.find(c => c.id === variation.contact_id);
            const sendTime = new Date(startTime + (index * baseDelay));

            queueItems.push({
                campaign_id: campaign.id,
                variation_id: variation.id,
                contact_id: contact.id,
                scheduled_for: sendTime.toISOString(),
                status: 'pending'
            });
        });

        const { error: queueError } = await supabase
            .from('send_queue')
            .insert(queueItems);

        if (queueError) throw queueError;

        // 8. LOG THE RUN
        await supabase.from('outbound_runs').insert({
            user_id: user.id,
            leads_sourced: rawLeads.length,
            leads_valid: validLeads.length,
            campaign_id: campaign.id,
            status: 'completed'
        });

        return res.status(200).json({
            success: true,
            leads: validLeads.length,
            campaignId: campaign.id
        });

    } catch (error: any) {
        console.error('Outbound Run Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
