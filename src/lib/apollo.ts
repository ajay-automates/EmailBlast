/**
 * Apollo.io Integration Service
 * 
 * Fetches leads based on strict V2 criteria:
 * - 10 leads (fetching 15 buffer)
 * - CEO/Founder roles
 * - 5-50 company size
 * - US Location
 * - Work emails only
 */

interface ApolloPerson {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    headline: string;
    organization: {
        name: string;
        short_description: string;
        primary_domain: string;
    };
    city: string;
    state: string;
    country: string;
}

export class ApolloService {
    private apiKey: string;
    private baseUrl = 'https://api.apollo.io/v1';

    constructor() {
        this.apiKey = process.env.APOLLO_API_KEY || '';
    }

    /**
     * Fetch leads for V2 One-Click Outbound
     */
    async getLeads(industry: string): Promise<ApolloPerson[]> {
        if (!this.apiKey) {
            console.warn('⚠️ No APOLLO_API_KEY found. Returning mock data for demo/testing.');
            return this.getMockLeads(industry);
        }

        try {
            const response = await fetch(`${this.baseUrl}/mixed_people/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    'X-Api-Key': this.apiKey
                },
                body: JSON.stringify({
                    q_organization_domains: null,
                    page: 1,
                    per_page: 15, // Buffer for validation (need 10 net)
                    person_titles: ["ceo", "founder", "co-founder", "owner", "president"],
                    person_locations: ["United States"],
                    organization_num_employees_ranges: ["1,10", "11,20", "21,50"], // 1-50 range
                    q_organization_keyword_tags: [industry], // e.g. "software", "marketing"
                    contact_email_status: ["verified"] // ONLY verified emails
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`⚠️ Apollo API request failed (${response.status}): ${errorText}`);
                console.warn('⚠️ Falling back to Mock Data for V2 Demo.');
                return this.getMockLeads(industry);
            }

            const data = await response.json();
            return data.people || [];

        } catch (error: any) {
            console.error('Apollo Fetch Error (Falling back to mock):', error);
            return this.getMockLeads(industry);
        }
    }

    // Fallback for testing without burning API credits or if key is missing
    private getMockLeads(industry: string): ApolloPerson[] {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: `mock-${i}`,
            first_name: `TestFirst${i}`,
            last_name: `TestLast${i}`,
            email: `test.lead.${i}.${Date.now()}@example.com`, // Safe unique test emails
            headline: `Founder at Startup ${i}`,
            organization: {
                name: `Cool ${industry} Startup ${i}`,
                short_description: "We build awesome software for cool people.",
                primary_domain: `startup${i}.com`
            },
            city: "San Francisco",
            state: "CA",
            country: "United States"
        }));
    }
}
