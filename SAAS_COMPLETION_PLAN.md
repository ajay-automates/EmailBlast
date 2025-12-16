# 🚀 SaaS-Ready Completion Plan

**Goal:** Complete P1 (Safety) + P2 (Polish) to make EmailBlast production-ready for consultancy outreach and client demos.

**Timeline:** 2 days of focused implementation

---

## 🔴 P1 — SAFETY & COMPLIANCE (Critical)

### A. Reply Handling Logic ✅

**What we're building:**

- Auto-detect replies via SendGrid Inbound Parse
- Mark contact as "replied" in database
- Stop all follow-ups for that contact
- Dashboard notification badge

**Implementation:**

1. Add `replied` boolean column to `contacts` table
2. Create `/api/webhooks/sendgrid-inbound` endpoint
3. Update follow-up logic to skip replied contacts
4. Add "Replied" badge in contact list UI

**Files to create/modify:**

- `schema.sql` (add column)
- `src/pages/api/webhooks/sendgrid-inbound.ts` (new)
- `src/pages/api/campaigns/[id]/send-followups.ts` (modify)
- `src/pages/dashboard/[id]/index.tsx` (UI badge)

---

### B. Unsubscribe & Suppression ✅

**What we're building:**

- One-click unsubscribe link in every email
- Suppression list (never email again)
- Auto-suppress bounces
- Check suppression before sending

**Implementation:**

1. Add `unsubscribed` and `bounced` columns to `contacts`
2. Create `/api/unsubscribe/[contactId]` public endpoint
3. Inject unsubscribe link into email footer
4. Update send logic to skip suppressed contacts
5. Auto-mark bounces as suppressed

**Files to create/modify:**

- `schema.sql` (add columns)
- `src/pages/api/unsubscribe/[contactId].ts` (new)
- `src/pages/api/campaigns/[id]/send.ts` (modify)
- `src/pages/api/webhooks/sendgrid.ts` (modify bounce handling)

---

### C. Daily Sending Limits ✅

**What we're building:**

- Per-campaign daily send cap
- Global daily send cap per user
- Queue-based sending with delays
- Dashboard showing "X/Y sent today"

**Implementation:**

1. Add `daily_limit` to campaigns table
2. Create `send_queue` table for scheduled sends
3. Add rate limiting logic to send endpoint
4. Create cron job for queue processing
5. UI to set daily limits

**Files to create/modify:**

- `schema.sql` (add tables/columns)
- `src/lib/send-queue.ts` (new)
- `src/pages/api/campaigns/[id]/send.ts` (modify)
- `src/pages/api/cron/process-queue.ts` (new)
- `src/pages/dashboard/[id]/send.tsx` (UI)

---

## 🟠 P2 — POLISH & USABILITY (Professional)

### D. Campaign Cloning ✅

**What we're building:**

- "Duplicate Campaign" button
- Clone campaign settings, context, subject
- Option to clone contacts too
- Fast setup for repeat outreach

**Implementation:**

1. Create `/api/campaigns/[id]/clone` endpoint
2. Add "Clone" button to campaign detail page
3. Modal to configure clone options

**Files to create/modify:**

- `src/pages/api/campaigns/[id]/clone.ts` (new)
- `src/pages/dashboard/[id]/index.tsx` (UI button)

---

### E. Preview Mode ✅

**What we're building:**

- Preview email for any contact
- See personalization filled in
- "Send Test Email" to yourself
- Approve before bulk send

**Implementation:**

1. Create `/api/campaigns/[id]/preview` endpoint
2. Add preview modal in send page
3. Test email functionality

**Files to create/modify:**

- `src/pages/api/campaigns/[id]/preview.ts` (new)
- `src/pages/dashboard/[id]/send.tsx` (UI modal)

---

### F. AI Prompt Control ✅

**What we're building:**

- Editable system prompt (admin only)
- Tone selector (Professional / Direct / Friendly)
- Save prompt per campaign
- Regenerate with different tone

**Implementation:**

1. Add `ai_prompt` and `tone` to campaigns table
2. Update generate endpoint to use custom prompt
3. UI for prompt editing (admin only)
4. Tone selector dropdown

**Files to create/modify:**

- `schema.sql` (add columns)
- `src/pages/api/campaigns/[id]/generate.ts` (modify)
- `src/pages/dashboard/[id]/generate.tsx` (UI)

---

## 📋 IMPLEMENTATION ORDER

### Day 1: Safety (P1)

1. ✅ Database schema updates
2. ✅ Reply handling (Inbound Parse)
3. ✅ Unsubscribe system
4. ✅ Daily sending limits
5. ✅ Queue processing

### Day 2: Polish (P2)

6. ✅ Campaign cloning
7. ✅ Email preview
8. ✅ AI prompt control
9. ✅ Testing & bug fixes
10. ✅ Documentation update

---

## 🎯 SUCCESS CRITERIA

When complete, you should be able to:

- [ ] Send 30 emails/day safely
- [ ] Auto-stop when someone replies
- [ ] One-click unsubscribe working
- [ ] Clone campaigns in 10 seconds
- [ ] Preview emails before sending
- [ ] Adjust AI tone per campaign
- [ ] See "X replied" badges in dashboard
- [ ] No risk of burning domain

---

**Let's build this. Starting with database schema updates...**
