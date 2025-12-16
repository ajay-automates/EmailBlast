-- ============================================
-- EmailBlast V2 Migration: One-Click Outbound
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create table to track daily runs (Limit Enforcement)
CREATE TABLE IF NOT EXISTS outbound_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  run_at TIMESTAMP DEFAULT NOW(),
  leads_sourced INT DEFAULT 0,
  leads_valid INT DEFAULT 0,
  campaign_id UUID REFERENCES campaigns(id),
  status TEXT DEFAULT 'completed' -- 'processing', 'completed', 'failed'
);

-- Index for fast 24h limit checks
CREATE INDEX IF NOT EXISTS idx_outbound_runs_user_date ON outbound_runs(user_id, run_at);

-- 2. Update campaigns table for auto-outbound metadata
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'standard',       -- 'standard' or 'auto_outbound'
ADD COLUMN IF NOT EXISTS target_industry TEXT,               -- User input
ADD COLUMN IF NOT EXISTS target_cta TEXT,                    -- User input
ADD COLUMN IF NOT EXISTS target_value_prop TEXT;             -- User input

-- 3. Update contacts table for enrichment data
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS enrichment_data JSONB; -- Stores AI context

-- 4. Verify Migration
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('outbound_runs', 'campaigns', 'contacts')
AND column_name IN ('type', 'target_industry', 'enrichment_data', 'leads_sourced');
