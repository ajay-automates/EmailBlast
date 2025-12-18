// Test Apollo API Integration
const APOLLO_API_KEY = 'r-EfpP4jW3d4kgZQ_JXQ3Q';

async function testApolloAPI() {
    console.log('🔍 Testing Apollo API Integration...\n');
    console.log('API Key:', APOLLO_API_KEY.substring(0, 10) + '...\n');

    const requestBody = {
        q_organization_domains: null,
        page: 1,
        per_page: 5,
        person_titles: ["ceo", "founder", "co-founder"],
        person_locations: ["United States"],
        organization_num_employees_ranges: ["1,10", "11,20", "21,50"],
        q_organization_keyword_tags: ["SaaS"],
        contact_email_status: ["verified"]
    };

    console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2), '\n');

    try {
        const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'X-Api-Key': APOLLO_API_KEY
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📥 Response Status:', response.status);
        console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()), '\n');

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ API Error:', data);
            return;
        }

        console.log('✅ Success! People found:', data.people?.length || 0);

        if (data.people && data.people.length > 0) {
            console.log('\n📋 First 3 Results:');
            data.people.slice(0, 3).forEach((person, i) => {
                console.log(`\n${i + 1}. ${person.first_name} ${person.last_name}`);
                console.log(`   Email: ${person.email}`);
                console.log(`   Company: ${person.organization?.name || 'N/A'}`);
                console.log(`   Title: ${person.headline || 'N/A'}`);
            });
        } else {
            console.log('\n⚠️ No people returned in response');
        }

    } catch (error) {
        console.error('❌ Fetch Error:', error.message);
        console.error('Full error:', error);
    }
}

testApolloAPI();
