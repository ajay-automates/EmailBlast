import Anthropic from '@anthropic-ai/sdk';

/**
 * AI Enrichment Service
 * Uses Claude to generate context and personalization for leads.
 */
export class AIEnrichmentService {
    private anthropic!: Anthropic; // Strict initialization assertion
    private hasKey: boolean;

    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        this.hasKey = !!apiKey;
        if (this.hasKey && apiKey) {
            this.anthropic = new Anthropic({ apiKey });
        }
    }

    async enrichLead(lead: any, myValueProp: string) {
        if (!this.hasKey) {
            // Mock enrichment if no key
            return {
                context: `Leader at ${lead.organization.name}`,
                icebreaker: `I saw your work at ${lead.organization.name} and was impressed.`
            };
        }

        try {
            const prompt = `
            Analyze this prospect:
            Name: ${lead.first_name} ${lead.last_name}
            Headline: ${lead.headline}
            Company: ${lead.organization.name}
            Description: ${lead.organization.short_description || 'N/A'}
            
            My Offer: ${myValueProp}

            Task:
            1. Write a 1-sentence "Company Context" summary (what they do).
            2. Write a 1-sentence "Icebreaker" connecting their work to my offer.

            Format Output exactly like this JSON:
            {
                "context": "...",
                "icebreaker": "..."
            }
            `;

            const message = await this.anthropic.messages.create({
                model: 'claude-3-haiku-20240307', // Haiku is fast & cheap for bulk
                max_tokens: 150,
                messages: [{ role: 'user', content: prompt }]
            });

            // Parse response safely
            const contentBlock = message.content[0];
            const text = contentBlock.type === 'text' ? contentBlock.text : '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                return {
                    context: `Company in ${lead.organization.name}`,
                    icebreaker: `I noticed you are leading ${lead.organization.name}.`
                };
            }

        } catch (error) {
            console.error('AI Enrichment Error:', error);
            return {
                context: `${lead.organization.name}`,
                icebreaker: `Hope you are having a great week at ${lead.organization.name}.`
            };
        }
    }
}
