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
                companyWebsite: `https://${lead.organization.name.toLowerCase().replace(/\s+/g, '')}.com`,
                companyServices: `Professional services in ${lead.organization.industry || 'their industry'}`,
                painPoints: `Scaling challenges common in ${lead.organization.industry || 'their sector'}`,
                icebreaker: `I noticed ${lead.organization.name} is growing in ${lead.organization.industry || 'the market'}`,
                personalizedHook: `Given your role as ${lead.headline}, I thought this might be relevant`
            };
        }

        try {
            // Enhanced prompt with deep research instructions
            const prompt = `You are a B2B sales research assistant. Analyze this prospect and generate REAL, SPECIFIC insights:

PROSPECT INFO:
- Name: ${lead.first_name} ${lead.last_name}
- Title: ${lead.headline}
- Company: ${lead.organization.name}
- Industry: ${lead.organization.industry || 'Unknown'}
- Company Description: ${lead.organization.short_description || 'Not provided'}
- Company Size: ${lead.organization.estimated_num_employees || 'Unknown'} employees
- Location: ${lead.city}, ${lead.state}, ${lead.country}

MY VALUE PROPOSITION:
${myValueProp}

TASK:
Research this company and person. Generate SPECIFIC, PERSONALIZED insights (not generic templates):

1. **Company Website**: Infer their likely website URL
2. **What They Do**: Specific services/products (be precise, not generic)
3. **Pain Points**: Real challenges they likely face based on their industry/size
4. **Personalized Icebreaker**: A specific observation about their company/role (NOT "I noticed you're doing great work")
5. **Hook**: Why MY offer is relevant to THEIR specific situation

Return ONLY valid JSON (no markdown, no extra text):
{
    "companyWebsite": "https://...",
    "companyServices": "Specific description of what they do",
    "painPoints": "Specific challenges they face",
    "icebreaker": "Specific observation about their company/work",
    "personalizedHook": "Why my offer matters to them specifically"
}`;

            const message = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022', // Upgraded to Sonnet for better research
                max_tokens: 500,
                messages: [{ role: 'user', content: prompt }]
            });

            // Parse response
            const contentBlock = message.content[0];
            const text = contentBlock.type === 'text' ? contentBlock.text : '';

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    companyWebsite: parsed.companyWebsite || `https://${lead.organization.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    companyServices: parsed.companyServices || `Services at ${lead.organization.name}`,
                    painPoints: parsed.painPoints || 'Growth and scaling challenges',
                    icebreaker: parsed.icebreaker || `I noticed your work at ${lead.organization.name}`,
                    personalizedHook: parsed.personalizedHook || `This could help ${lead.organization.name}`
                };
            } else {
                throw new Error('Failed to parse AI response');
            }

        } catch (error) {
            console.error('AI Enrichment Error:', error);
            // Fallback with better defaults
            return {
                companyWebsite: `https://${lead.organization.name.toLowerCase().replace(/\s+/g, '')}.com`,
                companyServices: `${lead.organization.short_description || `Professional services at ${lead.organization.name}`}`,
                painPoints: `Common challenges in ${lead.organization.industry || 'their industry'}`,
                icebreaker: `I came across ${lead.organization.name} and was impressed by your ${lead.organization.industry || 'work'}`,
                personalizedHook: `Given your focus on ${lead.organization.industry || 'growth'}, ${myValueProp}`
            };
        }
    }
}
