import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Filter and Validate Leads
 * 1. Deduplication (don't add if already exists)
 * 2. Suppression (unsubscribed/bounced)
 * 3. Cleaning (no role-based emails)
 */
export async function validateLeads(
    leads: any[],
    supabase: SupabaseClient
) {
    const validLeads = [];
    const seenEmails = new Set();

    // 1. Fetch Suppression List (Bounced/Unsubscribed contacts)
    // We get all contacts that are unsubscribed or bounced to check against
    const { data: suppressionList } = await supabase
        .from('contacts')
        .select('email')
        .or('unsubscribed.eq.true,bounced.eq.true');

    const suppressedEmails = new Set((suppressionList || []).map(c => c.email.toLowerCase()));

    // 2. Fetch ALL existing contact emails to prevent ANY duplicates (clean list policy)
    const { data: existingContacts } = await supabase
        .from('contacts')
        .select('email');

    const existingEmails = new Set((existingContacts || []).map(c => c.email.toLowerCase()));

    for (const lead of leads) {
        const email = lead.email.toLowerCase();

        // A. Basic Format Check
        if (!email.includes('@') || email.length < 5) continue;

        // B. Role-based check
        if (isRoleBased(email)) continue;

        // C. Suppression Check
        if (suppressedEmails.has(email)) continue;

        // D. Duplicate Check (Global) - We only want net-new leads for V2
        if (existingEmails.has(email)) continue;

        // E. Batch Duplicate Check
        if (seenEmails.has(email)) continue;

        seenEmails.add(email);
        validLeads.push(lead);

        // Stop once we have 10 perfect leads
        if (validLeads.length >= 10) break;
    }

    return validLeads;
}

function isRoleBased(email: string): boolean {
    const roles = ['admin', 'support', 'sales', 'info', 'contact', 'office', 'billing', 'help', 'jobs'];
    const prefix = email.split('@')[0];
    return roles.includes(prefix);
}
