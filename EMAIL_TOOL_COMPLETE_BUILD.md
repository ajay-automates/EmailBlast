# EMAIL OUTREACH AUTOMATION TOOL
## Complete Build Specification

---

## 🎯 OVERVIEW

**Tool Name:** EmailBlast (internal) or similar

**What it does:**
1. User uploads CSV of contacts (name, email, company)
2. AI generates 5 personalized email variations for each contact
3. Automatically sends emails via SendGrid
4. Tracks opens/clicks/replies in dashboard
5. Auto-follow-up sequences for non-responders

**Revenue Model:**
- Free: 50 emails/month
- Pro: $500/month (5,000 emails)
- Business: $2,000/month (unlimited)

**Build Time:** 11 weeks

**Timeline for you:** Week 1-11 (Dec 9, 2025 - Feb 9, 2026)

---

## 🏗️ TECHNICAL STACK

```
Frontend:
  - Next.js (React framework)
  - Tailwind CSS (styling)
  - TypeScript (type safety)
  - Shadcn/ui (component library)

Backend:
  - Next.js API routes
  - Node.js runtime
  - TypeScript

Database:
  - Supabase (PostgreSQL)
  - Realtime updates for dashboard

AI:
  - OpenAI GPT-4 API
  - Temperature: 0.7 (creative but consistent)

Email:
  - SendGrid API (sending)
  - SendGrid Webhooks (tracking opens/clicks)

Payments:
  - Stripe for subscriptions

Hosting:
  - Vercel (deploy Next.js)
  - Free tier includes serverless functions
```

---

## 📊 DATABASE SCHEMA

```sql
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
```

---

## 🔌 API ROUTES

```javascript
// File structure
/pages/api/
  /campaigns/
    index.ts          // GET all campaigns, POST new campaign
    [id].ts           // GET, PUT, DELETE specific campaign
    [id]/contacts/    // POST upload CSV
    [id]/generate     // POST generate variations
    [id]/send         // POST send emails
    [id]/analytics    // GET campaign stats
  /webhooks/
    sendgrid.ts       // Webhook for email events
  /auth/
    login.ts
    signup.ts
    logout.ts
  /user/
    profile.ts
    subscription.ts
```

---

## 📝 KEY API ENDPOINTS (Detailed)

### 1. CREATE CAMPAIGN
```typescript
// POST /api/campaigns
// Body: { name, subjectLine, context }
// Returns: { id, name, status, created_at }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { name, subjectLine, context } = req.body;
  const user = await getAuthUser(req);
  
  const campaign = await supabase
    .from('campaigns')
    .insert({
      user_id: user.id,
      name,
      subject_line: subjectLine,
      context,
      status: 'draft'
    })
    .select()
    .single();
  
  return res.json(campaign);
}
```

### 2. UPLOAD CONTACTS (CSV)
```typescript
// POST /api/campaigns/[id]/contacts
// Body: FormData with CSV file
// CSV format: first_name,last_name,email,company,position

import csv from 'csv-parser';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { id } = req.query;
  const user = await getAuthUser(req);
  
  // Check campaign ownership
  const campaign = await supabase
    .from('campaigns')
    .select()
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (!campaign) return res.status(403).json({ error: 'Not authorized' });
  
  // Parse CSV from form data
  const file = req.files.csv;
  const contacts = [];
  
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (row) => {
      contacts.push({
        campaign_id: id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        company: row.company,
        position: row.position
      });
    })
    .on('end', async () => {
      await supabase
        .from('contacts')
        .insert(contacts);
      
      res.json({ imported: contacts.length });
    });
}
```

### 3. GENERATE EMAIL VARIATIONS (GPT-4)
```typescript
// POST /api/campaigns/[id]/generate
// Body: { contactIds: [...] }
// Returns: Generated 5 variations per contact

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { id } = req.query;
  const { contactIds } = req.body;
  const user = await getAuthUser(req);
  
  // Get campaign & contacts
  const campaign = await supabase
    .from('campaigns')
    .select()
    .eq('id', id)
    .single();
  
  const contacts = await supabase
    .from('contacts')
    .select()
    .in('id', contactIds);
  
  for (const contact of contacts) {
    // Generate 5 variations per contact
    for (let i = 1; i <= 5; i++) {
      const prompt = `
You are an expert cold email copywriter. Generate a personalized cold email variation #${i}.

Context: ${campaign.context}
Recipient: ${contact.first_name} ${contact.last_name}
Company: ${contact.company}
Position: ${contact.position}
Subject: ${campaign.subject_line}

Requirements:
- Personalize with their name, company, and position
- Be concise (50-100 words)
- Include a clear CTA
- Sound natural, not templated
- Variation #${i} should have a DIFFERENT angle/hook than others

Return ONLY valid JSON:
{
  "subject": "...",
  "body": "..."
}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      });

      const parsed = JSON.parse(response.choices[0].message.content);

      // Save variation
      await supabase
        .from('email_variations')
        .insert({
          contact_id: contact.id,
          variation_number: i,
          subject: parsed.subject,
          body: parsed.body,
          personalization_data: {
            firstName: contact.first_name,
            company: contact.company,
            position: contact.position
          }
        });
    }
  }
  
  res.json({ generated: contactIds.length * 5 });
}
```

### 4. SEND EMAILS
```typescript
// POST /api/campaigns/[id]/send
// Body: { variationIds: [...] }
// Sends via SendGrid, tracks opens/clicks

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { id } = req.query;
  const { variationIds } = req.body;
  const user = await getAuthUser(req);
  
  const variations = await supabase
    .from('email_variations')
    .select(`
      *,
      contact:contact_id(email, first_name)
    `)
    .in('id', variationIds);
  
  const sentIds = [];
  
  for (const variation of variations) {
    const msg = {
      to: variation.contact.email,
      from: user.email, // User's SendGrid verified email
      subject: variation.subject,
      text: variation.body,
      html: `<p>${variation.body}</p>`,
      // Add tracking pixel
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
        subscriptionTracking: { enable: false }
      },
      // Add custom header for webhook matching
      headers: {
        'X-Email-ID': variation.id
      }
    };
    
    try {
      const [{ id: messageId }] = await sgMail.send(msg);
      
      // Log sent email
      await supabase
        .from('email_logs')
        .insert({
          variation_id: variation.id,
          contact_id: variation.contact_id,
          sent_at: new Date(),
          sendgrid_message_id: messageId,
          status: 'sent'
        });
      
      sentIds.push(variation.id);
    } catch (error) {
      console.error('SendGrid error:', error);
    }
  }
  
  // Update campaign status
  await supabase
    .from('campaigns')
    .update({ status: 'active' })
    .eq('id', id);
  
  res.json({ sent: sentIds.length });
}
```

### 5. SENDGRID WEBHOOK (Track opens/clicks)
```typescript
// POST /api/webhooks/sendgrid
// Receives webhook from SendGrid for opens, clicks, etc

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const events = req.body;
  
  for (const event of events) {
    const variationId = event.headers?.['x-email-id'];
    
    if (event.event === 'open') {
      await supabase
        .from('email_logs')
        .update({ 
          opened_at: new Date(),
          status: 'opened'
        })
        .eq('sendgrid_message_id', event.sg_message_id);
    }
    
    if (event.event === 'click') {
      await supabase
        .from('email_logs')
        .update({ 
          clicked_at: new Date(),
          status: 'clicked'
        })
        .eq('sendgrid_message_id', event.sg_message_id);
    }
    
    if (event.event === 'bounce') {
      await supabase
        .from('email_logs')
        .update({ 
          status: 'bounced'
        })
        .eq('sendgrid_message_id', event.sg_message_id);
    }
  }
  
  res.json({ received: events.length });
}
```

### 6. CAMPAIGN ANALYTICS
```typescript
// GET /api/campaigns/[id]/analytics

export default async function handler(req, res) {
  const { id } = req.query;
  const user = await getAuthUser(req);
  
  const logs = await supabase
    .from('email_logs')
    .select('status')
    .eq('campaign_id', id);
  
  const totalSent = logs.length;
  const opened = logs.filter(l => l.status === 'opened' || l.status === 'clicked').length;
  const clicked = logs.filter(l => l.status === 'clicked').length;
  const replied = logs.filter(l => l.status === 'replied').length;
  
  return res.json({
    totalSent,
    opened,
    clicked,
    replied,
    openRate: (opened / totalSent * 100).toFixed(1) + '%',
    clickRate: (clicked / totalSent * 100).toFixed(1) + '%',
    replyRate: (replied / totalSent * 100).toFixed(1) + '%'
  });
}
```

---

## 🎨 FRONTEND PAGES

```
/pages/
  /dashboard/
    index.tsx         // Campaign list
    [id]/
      index.tsx       // Campaign detail
      upload.tsx      // CSV upload
      generate.tsx    // Email generation
      send.tsx        // Send confirmation
      analytics.tsx   // Campaign metrics
  /auth/
    login.tsx
    signup.tsx
  settings.tsx        // User subscription
```

### Dashboard Page (Campaign List)
```typescript
export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const router = useRouter();
  
  useEffect(() => {
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(setCampaigns);
  }, []);
  
  const createNew = async () => {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Campaign',
        subjectLine: '',
        context: ''
      })
    }).then(r => r.json());
    
    router.push(`/dashboard/${res.id}`);
  };
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Email Campaigns</h1>
      
      <button 
        onClick={createNew}
        className="bg-blue-500 text-white px-6 py-2 rounded"
      >
        New Campaign
      </button>
      
      <div className="mt-8 grid gap-4">
        {campaigns.map(c => (
          <div 
            key={c.id}
            className="border p-4 rounded cursor-pointer hover:shadow"
            onClick={() => router.push(`/dashboard/${c.id}`)}
          >
            <h3 className="font-bold">{c.name}</h3>
            <p className="text-sm text-gray-600">Status: {c.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📦 SETUP INSTRUCTIONS

### Step 1: Create Supabase Project
```bash
# Go to supabase.com
# Create new project
# Get credentials
# Run SQL schema above in SQL editor
```

### Step 2: Create OpenAI API Key
```bash
# Go to platform.openai.com
# Create new API key
# Set as OPENAI_API_KEY env var
```

### Step 3: Setup SendGrid
```bash
# Create account at sendgrid.com
# Verify sender email address
# Create API key
# Set as SENDGRID_API_KEY env var
# Enable webhook tracking
  Webhook URL: https://yourdomain.com/api/webhooks/sendgrid
```

### Step 4: Create Stripe Account
```bash
# Create account at stripe.com
# Get publishable & secret keys
# Setup products for plans (free, pro, business)
```

### Step 5: Create Next.js Project
```bash
npx create-next-app@latest email-tool --typescript
cd email-tool

# Install dependencies
npm install @supabase/supabase-js
npm install @sendgrid/mail
npm install openai
npm install stripe
npm install csv-parser
npm install multer

# Create .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
OPENAI_API_KEY=
SENDGRID_API_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# Deploy to Vercel
npm install -g vercel
vercel
```

---

## 💰 MONETIZATION

**Stripe Setup:**
```javascript
// POST /api/user/subscribe
// Body: { planId: 'pro' | 'business' }

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { planId } = req.body;
  const user = await getAuthUser(req);
  
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    mode: 'subscription',
    line_items: [
      {
        price: process.env[`STRIPE_PRICE_${planId.toUpperCase()}`],
        quantity: 1
      }
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`
  });
  
  return res.json({ sessionId: session.id });
}
```

---

## 🎯 WEEK-BY-WEEK BREAKDOWN

**Week 1-2:**
- [ ] Setup Supabase, OpenAI, SendGrid, Stripe accounts
- [ ] Create Next.js project
- [ ] Build database schema
- [ ] Setup authentication (basic email/password)

**Week 3-4:**
- [ ] Build API routes for campaigns CRUD
- [ ] Build CSV upload + parsing
- [ ] Test data import

**Week 5-6:**
- [ ] Build GPT-4 integration for email generation
- [ ] Test prompt engineering
- [ ] Build email variations storage

**Week 7-8:**
- [ ] Build SendGrid integration
- [ ] Build email sending logic
- [ ] Setup webhook for tracking

**Week 9-10:**
- [ ] Build dashboard UI (Next.js + Tailwind)
- [ ] Build campaign detail page
- [ ] Build analytics page
- [ ] Test entire flow end-to-end

**Week 11:**
- [ ] Bug fixes and optimization
- [ ] Setup Stripe payments
- [ ] Prepare for launch
- [ ] Create landing page

---

## 🚀 LAUNCH CHECKLIST

- [ ] All features working
- [ ] Database optimized
- [ ] Stripe payments working
- [ ] SendGrid webhook receiving events
- [ ] Analytics calculating correctly
- [ ] Landing page ready
- [ ] Security: Authentication working
- [ ] Rate limiting on API routes
- [ ] Error handling in place

---

## 💡 USAGE FLOW (For Video)

**Your YouTube video will show:**

1. Create new campaign ("Getting 50 leads")
2. Upload CSV (contacts you're targeting)
3. Fill in subject line ("Hey {firstName}")
4. Add context ("Software engineer at mid-market SaaS")
5. Generate variations (AI creates 5 versions)
6. Review variations in dashboard
7. Send (one-click)
8. Watch dashboard in real-time
   - Emails sent ✅
   - Opens tracked 👀
   - Clicks tracked 🔗
   - Replies incoming 📧

**Metrics for video:**
- "50 emails sent in 5 minutes"
- "First open in 3 minutes"
- "First reply in 8 minutes"
- "20% open rate (vs industry 5%)"
- "5 replies already"

This is your case study AND your YouTube video.

