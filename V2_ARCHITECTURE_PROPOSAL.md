# 🏗️ EmailBlast V2: Architecture & Data Model Proposal

**Status:** Draft for Approval
**Objective:** Implement One-Click AI Outbound with strict "10 leads/day" limits and Apollo integration.

---

## 1. Database Schema Changes

We need to track "Daily Runs" to strictly enforce the limit and store the user's specific inputs for these auto-campaigns.

### A. New Table: `outbound_runs`

Tracks the daily execution log for each user to enforce the 24h cooldown/limit.

```sql
CREATE TABLE outbound_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  run_at TIMESTAMP DEFAULT NOW(),
  leads_sourced INT DEFAULT 0,
  leads_valid INT DEFAULT 0,
  campaign_id UUID REFERENCES campaigns(id),
  status TEXT DEFAULT 'completed' -- 'processing', 'completed', 'failed'
);

-- Index to quickly check "Has user run today?"
CREATE INDEX idx_outbound_runs_user_date ON outbound_runs(user_id, run_at);
```

### B. Update Table: `campaigns`

Add fields to store the specific parameters used for this auto-campaign (so we know it's an auto-campaign and what the inputs were).

```sql
ALTER TABLE campaigns 
ADD COLUMN type TEXT DEFAULT 'standard',       -- 'standard' or 'auto_outbound'
ADD COLUMN target_industry TEXT,               -- User input
ADD COLUMN target_cta TEXT,                    -- User input
ADD COLUMN target_value_prop TEXT;             -- User input
```

### C. Update Table: `contacts`

Add enrichment data fields to store the AI context (for debugging and visibility).

```sql
ALTER TABLE contacts
ADD COLUMN enrichment_data JSONB; -- Stores { "company_summary": "...", "latest_news": "..." }
```

---

## 2. System Architecture

The "One Button" controller will act as an orchestrator.

### Core Controller (`lib/outbound-orchestrator.ts`)

This function runs the entire flow sequentially:

1. **Check Limits:** Query `outbound_runs` for user in last 24h. If found -> Error.
2. **Source Leads:** Call `ApolloService.getLeads(filters)`.
3. **Validate:** Filter list against Global Suppression Table & Formatting rules.
4. **Enrich:** Call `OpenAIService` to generate `enrichment_data` for each lead.
5. **Create Campaign:** Insert into `campaigns` with `type='auto_outbound'`.
6. **Generate Emails:** Use Locked System Prompt + User Inputs (Industry, CTA).
7. **Queue:** Insert 10 emails into `send_queue`.
8. **Log Run:** Insert into `outbound_runs`.

### Services

* `lib/apollo.ts`: Handles communication with Apollo API.
* `lib/filters.ts`: Logic for suppressing bounces/unsubscribes.

---

## 3. Data Flow (The "One Click")

```
[ frontend ] -> POST /api/outbound/start 
    |
    v
[ backend ] -> Check 24h Limit (DB) -> 🛑 Stop if limit hit
    |
    v
[ Apollo API ] -> Fetch 15 leads (buffer for validation)
    |
    v
[ Validation ] -> Remove bad emails, unsubscribes -> Keep 10
    |
    v
[ AI Engine ] -> Generate Context + Personalization
    |
    v
[ DB Transaction ] -> Create Campaign -> Add Contacts -> Create Emails -> Log Run
    |
    v
[ Return Success ] -> Dashboard updates to show "Processing..."
```

---

## 4. API Routes

1. **`POST /api/outbound/run`**
    * **Body:** `{ industry, ctaLink, valueProp }`
    * **Action:** Triggers the Main Flow.
    * **Returns:** `{ success: true, runId: "..." }`

2. **`GET /api/outbound/status`**
    * **Action:** Checks if user can run today.
    * **Returns:** `{ canRun: boolean, timeUntilNextRun: "12h 30m" }`

---

## 5. Security & Safety

* **Apollo Key:** Stored in `env.local` (Server-side only).
* **Rate Limits:** Enforced at Database level (Index on `run_at`).
* **Prompt Injection:** System prompt is hardcoded in the backend; user inputs are sanitized and only inserted into specific slots.

---

## 6. Implementation Plan (In Order)

1. **Migration:** Run SQL to update tables.
2. **Apollo Service:** Implement lead fetching.
3. **Orchestrator:** Build the limit check & flow logic.
4. **UI:** Add the "One Click" card to Dashboard.
5. **Verify:** Test with dry-run (no sending).

**Approval required to proceed with Database Migration.**
