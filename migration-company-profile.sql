-- Migration: Company Profile & Email Templates
-- Run this in Supabase SQL Editor

-- Create company_profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Basic Info
  company_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  
  -- Contact Person
  sender_name VARCHAR(255) NOT NULL,
  sender_title VARCHAR(255),
  sender_email VARCHAR(255) NOT NULL,
  sender_phone VARCHAR(50),
  sender_linkedin VARCHAR(500),
  
  -- Business Details
  tagline VARCHAR(500),
  description TEXT,
  services TEXT[],
  unique_value_proposition TEXT,
  target_audience TEXT,
  
  -- Results/Proof
  key_results TEXT[],
  testimonials JSONB,
  case_studies JSONB,
  
  -- Preferences
  tone VARCHAR(50) DEFAULT 'professional',
  call_to_action VARCHAR(500),
  calendar_link VARCHAR(500),
  
  -- AI-Generated
  website_summary TEXT,
  extracted_services TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Template Info
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  use_case VARCHAR(100) NOT NULL,
  
  -- Template Content
  subject_line VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  
  -- Metadata
  description TEXT,
  tags TEXT[],
  is_system BOOLEAN DEFAULT true,
  user_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_templates_industry ON email_templates(industry);
CREATE INDEX IF NOT EXISTS idx_templates_use_case ON email_templates(use_case);

-- Insert system templates
INSERT INTO email_templates (name, industry, use_case, subject_line, body, description, tags) VALUES

-- AI/Automation
('Time-Savings Focus', 'AI & Automation', 'cold_outreach',
'Quick question about {{company}}''s workflows',
'Hey {{firstName}},

I noticed {{company}} is growing — congrats!

Quick question: How much time does your team spend on manual, repetitive tasks each week?

I help founders automate workflows that eat up their time. One recent client saved 12+ hours/week by connecting their CRM, email, and reporting into one automated system.

Would you be open to a 15-minute call to see if there''s a similar opportunity at {{company}}?

Best,
{{senderName}}',
'Direct approach focusing on time savings', 
ARRAY['automation', 'time-saving', 'founders']),

('Direct Offer', 'AI & Automation', 'cold_outreach',
'{{firstName}}, spotted an automation opportunity',
'Hey {{firstName}},

As {{position}} at {{company}}, I imagine you''re juggling a lot of manual processes.

I build AI systems that handle exactly that. Not Zapier templates — real production systems.

Recent example: automated an agency''s entire client onboarding, cutting 8 hours of admin work per week to zero.

Worth a 15-min chat to see if something similar fits {{company}}?

— {{senderName}}',
'Direct automation pitch',
ARRAY['automation', 'ai', 'direct']),

-- Marketing Agency
('Agency Partnership', 'Marketing Agency', 'cold_outreach',
'{{firstName}}, quick idea for {{company}}',
'Hey {{firstName}},

I came across {{company}} and was impressed by your work.

I run {{companyName}} — {{tagline}}.

Would love to explore if there''s a fit for a partnership or if we can help with any overflow work.

Worth a quick chat?

{{senderName}}',
'Partnership-focused outreach',
ARRAY['agency', 'partnership', 'b2b']),

-- SaaS
('Pain-Point Focus', 'SaaS / Software', 'cold_outreach',
'Solving {{company}}''s [specific problem]',
'Hey {{firstName}},

Running a SaaS at your stage, I imagine [specific pain] is probably taking up more time than you''d like.

We built {{companyName}} specifically for this — {{tagline}}.

{{keyResults}}

Would it make sense to jump on a quick call to see if we could help {{company}}?

{{senderName}}',
'Pain-focused SaaS outreach',
ARRAY['saas', 'software', 'pain-point']),

-- Restaurant
('Customer Invitation', 'Restaurant / Food', 'promotion',
'{{firstName}}, your table is waiting at {{companyName}} 🍽️',
'Hi {{firstName}},

We wanted to personally invite you to experience {{companyName}}.

Whether it''s a casual dinner, a special celebration, or just great food with friends — we''d love to host you.

This week''s specials:
{{services}}

Book your table: {{calendarLink}}

Looking forward to seeing you!

Warm regards,
{{senderName}}
{{companyName}}',
'Promotional restaurant invitation',
ARRAY['restaurant', 'promotion', 'food']),

-- E-commerce
('Win-Back Campaign', 'E-commerce', 'follow_up',
'We miss you, {{firstName}}!',
'Hey {{firstName}},

It''s been a while since we''ve seen you at {{companyName}}!

We''ve added some new products we think you''ll love:
{{services}}

As a thank you for being a valued customer, here''s [special offer] just for you.

[Shop Now]

See you soon,
{{senderName}}
{{companyName}}',
'Customer win-back email',
ARRAY['ecommerce', 'winback', 'retention']),

-- Real Estate
('Property Listing Alert', 'Real Estate', 'cold_outreach',
'{{firstName}}, properties matching your criteria',
'Hi {{firstName}},

I hope this email finds you well!

I came across some properties that I thought might interest you:

[Property highlights]

Would you like to schedule a viewing this week?

Feel free to call me directly at {{senderPhone}} or book a time here: {{calendarLink}}

Best regards,
{{senderName}}
{{senderTitle}}',
'Property listing notification',
ARRAY['real-estate', 'listings', 'properties']),

-- Consulting
('Expertise Offer', 'Consulting', 'cold_outreach',
'{{firstName}}, quick thought on {{company}}',
'{{firstName}},

I''ll keep this brief.

I lead {{companyName}} — {{tagline}}.

Looking at {{company}}, I see a few areas where we might be able to help:
{{services}}

Not trying to sell you anything. Just curious if any of these resonate.

15 minutes to explore?

{{senderName}}',
'Direct consulting introduction',
ARRAY['consulting', 'b2b', 'services']),

-- Follow-ups (All Industries)
('Follow-up #1', 'All Industries', 'follow_up',
'Re: [Original Subject]',
'Hey {{firstName}},

Just floating this back up — did you get a chance to see my note?

Happy to jump on a quick call if there''s any interest.

{{senderName}}',
'First follow-up',
ARRAY['follow-up', 'reminder']),

('Break-up Email', 'All Industries', 'follow_up',
'Should I close your file?',
'{{firstName}},

I''ve reached out a few times and haven''t heard back — totally understand if the timing isn''t right.

I''ll assume {{company}} isn''t looking for help with this right now.

If anything changes, feel free to reach out anytime.

Best,
{{senderName}}',
'Final follow-up',
ARRAY['follow-up', 'break-up', 'final']);

-- Success message
SELECT 'Migration completed successfully!' as message;
