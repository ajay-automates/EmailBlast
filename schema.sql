-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  company TEXT,
  plan TEXT DEFAULT 'free', -- free, pro, business
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject_line TEXT,
  context TEXT, -- instructions for AI personalization
  status TEXT DEFAULT 'draft', -- draft, scheduled, sent, active
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  company TEXT,
  position TEXT,
  imported_at TIMESTAMP DEFAULT NOW()
);

-- Email variations table
CREATE TABLE email_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  variation_number INT, -- 1-5
  subject TEXT,
  body TEXT,
  personalization_data JSONB, -- {companyName, position, etc}
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email logs table (tracking)
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variation_id UUID REFERENCES email_variations(id),
  contact_id UUID REFERENCES contacts(id),
  sent_at TIMESTAMP DEFAULT NOW(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  replied_at TIMESTAMP,
  reply_text TEXT,
  sendgrid_message_id TEXT UNIQUE,
  status TEXT -- sent, bounced, opened, clicked, replied
);

-- Follow-up sequences table
CREATE TABLE followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id),
  contact_id UUID REFERENCES contacts(id),
  delay_hours INT, -- send after X hours
  email_variation_id UUID REFERENCES email_variations(id),
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  status TEXT DEFAULT 'scheduled'
);

-- Analytics summary table
CREATE TABLE campaign_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id),
  total_sent INT DEFAULT 0,
  total_opened INT DEFAULT 0,
  total_clicked INT DEFAULT 0,
  total_replied INT DEFAULT 0,
  open_rate DECIMAL,
  click_rate DECIMAL,
  reply_rate DECIMAL,
  updated_at TIMESTAMP DEFAULT NOW()
);
