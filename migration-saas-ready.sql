-- ============================================
-- EmailBlast - SaaS-Ready Database Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Add new columns to contacts table
ALTER TABLE contacts 
  ADD COLUMN IF NOT EXISTS replied BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bounced BOOLEAN DEFAULT FALSE;

-- Add new columns to campaigns table
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS ai_prompt TEXT,
  ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS daily_limit INT DEFAULT 50;

-- Create send_queue table for rate-limited sending
CREATE TABLE IF NOT EXISTS send_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  variation_id UUID REFERENCES email_variations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status TEXT DEFAULT 'pending', -- pending, sent, failed, cancelled
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_send_queue_scheduled 
  ON send_queue(scheduled_for) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_contacts_campaign 
  ON contacts(campaign_id);

CREATE INDEX IF NOT EXISTS idx_contacts_status 
  ON contacts(replied, unsubscribed, bounced);

CREATE INDEX IF NOT EXISTS idx_email_logs_contact 
  ON email_logs(contact_id);

-- Verify migration
SELECT 
  'contacts' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'contacts'
  AND column_name IN ('replied', 'unsubscribed', 'bounced')

UNION ALL

SELECT 
  'campaigns' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'campaigns'
  AND column_name IN ('ai_prompt', 'tone', 'daily_limit')

UNION ALL

SELECT 
  'send_queue' as table_name,
  'table_exists' as column_name,
  'true' as data_type
FROM information_schema.tables
WHERE table_name = 'send_queue';

-- Success message
SELECT 'Migration complete! ✅' as status;
