import { supabase } from './supabase'

/**
 * Send Queue Manager
 * 
 * Manages daily sending limits to protect domain reputation.
 * Instead of sending all emails immediately, we queue them
 * and process them gradually throughout the day.
 * 
 * Default: 50 emails/day per campaign
 * Recommended for cold outreach: 20-40 emails/day
 */

export interface QueueEmailParams {
    campaignId: string
    variationId: string
    contactId: string
    scheduledFor?: Date
}

/**
 * Add emails to the send queue
 * Respects daily limits and spreads sends throughout the day
 */
export async function queueEmails(
    emails: QueueEmailParams[],
    dailyLimit: number = 50
): Promise<{ queued: number; rejected: number; message: string }> {
    try {
        if (emails.length === 0) {
            return { queued: 0, rejected: 0, message: 'No emails to queue' }
        }

        const campaignId = emails[0].campaignId

        // Check how many emails already sent/queued today for this campaign
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: sentToday, error: sentError } = await supabase
            .from('send_queue')
            .select('id')
            .eq('campaign_id', campaignId)
            .gte('created_at', today.toISOString())

        if (sentError) {
            console.error('[Queue] Error checking sent count:', sentError)
            throw new Error('Failed to check daily limit')
        }

        const alreadySent = sentToday?.length || 0
        const remaining = Math.max(0, dailyLimit - alreadySent)

        if (remaining === 0) {
            return {
                queued: 0,
                rejected: emails.length,
                message: `Daily limit reached (${dailyLimit} emails). Try again tomorrow.`,
            }
        }

        // Queue only what we can send today
        const toQueue = emails.slice(0, remaining)
        const rejected = emails.length - toQueue.length

        // Spread sends throughout the day (every 15-30 minutes)
        const now = new Date()
        const queueRecords = toQueue.map((email, index) => {
            // Schedule with 15-30 minute intervals
            const delayMinutes = index * (Math.random() * 15 + 15) // 15-30 min spacing
            const scheduledFor = email.scheduledFor || new Date(now.getTime() + delayMinutes * 60 * 1000)

            return {
                campaign_id: email.campaignId,
                variation_id: email.variationId,
                contact_id: email.contactId,
                scheduled_for: scheduledFor.toISOString(),
                status: 'pending',
            }
        })

        const { error: insertError } = await supabase
            .from('send_queue')
            .insert(queueRecords)

        if (insertError) {
            console.error('[Queue] Error inserting:', insertError)
            throw new Error('Failed to queue emails')
        }

        console.log(`[Queue] ✅ Queued ${toQueue.length} emails, rejected ${rejected}`)

        return {
            queued: toQueue.length,
            rejected,
            message: `Queued ${toQueue.length} emails${rejected > 0 ? `, ${rejected} exceeded daily limit` : ''}`,
        }
    } catch (error: any) {
        console.error('[Queue] Error:', error)
        throw error
    }
}

/**
 * Get pending emails ready to send
 * Called by cron job every 15 minutes
 */
export async function getPendingEmails(limit: number = 10): Promise<any[]> {
    try {
        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('send_queue')
            .select(`
        *,
        variation:variation_id(*),
        contact:contact_id(*),
        campaign:campaign_id(*)
      `)
            .eq('status', 'pending')
            .lte('scheduled_for', now)
            .limit(limit)
            .order('scheduled_for', { ascending: true })

        if (error) {
            console.error('[Queue] Error fetching pending:', error)
            return []
        }

        return data || []
    } catch (error: any) {
        console.error('[Queue] Error:', error)
        return []
    }
}

/**
 * Mark email as sent in queue
 */
export async function markAsSent(queueId: string, messageId: string): Promise<void> {
    await supabase
        .from('send_queue')
        .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
        })
        .eq('id', queueId)
}

/**
 * Mark email as failed in queue
 */
export async function markAsFailed(queueId: string, error: string): Promise<void> {
    await supabase
        .from('send_queue')
        .update({
            status: 'failed',
        })
        .eq('id', queueId)
}

/**
 * Get queue stats for a campaign
 */
export async function getQueueStats(campaignId: string): Promise<{
    pending: number
    sent: number
    failed: number
    total: number
}> {
    const { data } = await supabase
        .from('send_queue')
        .select('status')
        .eq('campaign_id', campaignId)

    const stats = {
        pending: 0,
        sent: 0,
        failed: 0,
        total: data?.length || 0,
    }

    data?.forEach((item) => {
        if (item.status === 'pending') stats.pending++
        if (item.status === 'sent') stats.sent++
        if (item.status === 'failed') stats.failed++
    })

    return stats
}
