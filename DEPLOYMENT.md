# EmailBlast Deployment & Launch Guide

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Code editor (VS Code recommended)
- Git

### Step 1: Clone/Setup Project
```bash
cd EmailBlast
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Create new project"
3. Choose a region closest to you
4. Create project

**Get your credentials:**
- Project URL: Settings → API → URL
- Anon Key: Settings → API → Anon Key
- Service Role Key: Settings → API → Service Role Key

### Step 3: Setup Database

1. In Supabase dashboard, go to "SQL Editor"
2. Create new query
3. Copy entire `schema.sql` file contents
4. Execute the query

### Step 4: Setup OpenAI

1. Go to [platform.openai.com](https://platform.openai.com/account/api-keys)
2. Create new API key
3. Copy the key (you won't see it again)

### Step 5: Setup SendGrid

1. Go to [sendgrid.com](https://sendgrid.com)
2. Create account
3. **Verify a sender email:**
   - Settings → Sender Authentication → Single Sender Verification
   - Verify an email address you own
4. **Create API key:**
   - Settings → API Keys
   - Create "Full Access" key
   - Copy the key

### Step 6: Configure Environment

1. Copy `.env.local` template:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-proj-...
SENDGRID_API_KEY=SG.xxxx...
NEXT_PUBLIC_URL=http://localhost:3000
```

2. Replace with your actual credentials

### Step 7: Run Local Dev Server

```bash
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

### Step 8: Setup SendGrid Webhooks

1. In Supabase, go to Functions → Webhooks
2. Or manually configure in SendGrid:
   - Settings → Event Webhook
   - URL: `http://localhost:3000/api/webhooks/sendgrid` (local) or `https://yourdomain.com/api/webhooks/sendgrid` (production)
   - Select: Opens, Clicks, Bounces, Delivered
   - Test and Verify

---

## 🌐 Deploy to Vercel

### Prerequisites
- Vercel account (free at [vercel.com](https://vercel.com))
- GitHub repo with your code

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create repo on github.com and add remote
git remote add origin https://github.com/yourusername/emailblast.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo
4. Add environment variables:
   - Click "Environment Variables"
   - Add all from `.env.local`
5. Click "Deploy"

**Option B: Using Vercel CLI**
```bash
npm install -g vercel
vercel
# Follow prompts to link project
```

### Step 3: Add Environment Variables

After deployment:
1. Go to project in Vercel dashboard
2. Settings → Environment Variables
3. Add all variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_KEY
   - OPENAI_API_KEY
   - SENDGRID_API_KEY
   - NEXT_PUBLIC_URL=https://your-vercel-domain.vercel.app

### Step 4: Redeploy with Variables

```bash
vercel --prod
```

### Step 5: Update SendGrid Webhook URL

1. Go to SendGrid settings
2. Mail Send → Event Webhook
3. Update URL to your Vercel domain:
   - `https://your-domain.vercel.app/api/webhooks/sendgrid`

---

## 🔐 Security Checklist

Before launching to production:

- [ ] All API keys are in environment variables (not in code)
- [ ] No console.log() statements with sensitive data
- [ ] CORS is configured properly
- [ ] SendGrid webhook is verified
- [ ] Rate limiting is enabled on API routes
- [ ] Database RLS (Row Level Security) is configured
- [ ] HTTPS is enforced
- [ ] Error messages don't expose sensitive info

### Add Rate Limiting

Create `src/lib/rateLimit.ts`:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
})
```

---

## 📊 Testing Before Launch

### Manual Testing Checklist

- [ ] Create a campaign
- [ ] Upload 5 test contacts
- [ ] Generate emails
- [ ] Review variations
- [ ] Send one test email
- [ ] Check SendGrid delivery
- [ ] Open email (test open tracking)
- [ ] Click link in email (test click tracking)
- [ ] Verify metrics update

### Test with Real Email

1. Create campaign with your email as contact
2. Generate and send emails
3. Open email and verify:
   - Open tracking pixel doesn't break layout
   - Personalization works
   - Links are clickable
   - Unsubscribe link is present

---

## 💰 Stripe Setup (For Payments)

### Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Verify email

### Create Products

1. Go to Products → Add Product

**Create "Pro" Plan:**
- Name: Pro Email Outreach
- Price: $500/month
- Billing period: Monthly
- Copy Price ID: `price_xxx...`

**Create "Business" Plan:**
- Name: Business Email Outreach  
- Price: $2,000/month
- Billing period: Monthly
- Copy Price ID: `price_xxx...`

### Get API Keys

1. Developers → API Keys
2. Copy:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

### Add to Environment Variables

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_PRO=price_xxx...
STRIPE_PRICE_BUSINESS=price_xxx...
```

### Deploy stripe-js

```bash
npm install @stripe/stripe-js
```

---

## 🎬 Record Your Demo Video

### What to Record

1. **Create Campaign** (30 seconds)
   - Show form
   - Fill in details
   - Save

2. **Upload Contacts** (1 minute)
   - Show CSV file
   - Drag and drop
   - Show preview
   - Click import

3. **Generate Emails** (1 minute)
   - Show "Generate" button
   - Wait for completion
   - Show progress

4. **Send Emails** (1 minute)
   - Show email variations
   - Select to send
   - Click send
   - Show confirmation

5. **Analytics** (2 minutes)
   - Show real-time metrics
   - Refresh to show updates
   - Show individual email opens

### Video Stats to Highlight

- ⏱️ "50 emails sent in 5 minutes"
- 👀 "First open in 3 minutes"
- 🔗 "First click in 8 minutes"  
- 📊 "20% open rate (vs industry 5%)"
- 💬 "5 replies already"

### YouTube Title Ideas

- "I Built an AI Email Tool That Got 5 Replies in 8 Minutes"
- "Automating Cold Email Outreach with AI (50 Personalized Emails)"
- "Watch This AI Generate & Send 50 Cold Emails (With Results)"

---

## 📞 Troubleshooting

### Issue: Emails not sending

**Check:**
1. SendGrid API key is correct
2. Sender email is verified in SendGrid
3. Check SendGrid Event History for bounces
4. Check API logs for errors

**Fix:**
```bash
# Test SendGrid API key
curl https://api.sendgrid.com/v3/api_keys \
  -H "Authorization: Bearer SG_KEY_HERE" \
  -H "Content-Type: application/json"
```

### Issue: OpenAI errors

**Check:**
1. API key is valid
2. Account has credits
3. Rate limiting isn't triggered
4. Model `gpt-4` is available in your region

**Fix:**
```bash
# Check OpenAI API status
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk_APIKEY"
```

### Issue: Supabase connection fails

**Check:**
1. URL and keys are correct
2. Database is running
3. Network isn't blocked
4. RLS policies allow access

**Fix:**
```bash
# Test Supabase connection
curl -H "apikey: ANON_KEY" \
  "https://project.supabase.co/rest/v1/campaigns"
```

### Issue: Build fails on Vercel

**Check:**
1. All environment variables are set
2. No TypeScript errors: `npx tsc --noEmit`
3. All imports are correct
4. `node_modules` is in `.gitignore`

---

## 🚀 Go-Live Checklist

- [ ] Domain is purchased and configured
- [ ] SSL certificate is active
- [ ] Database backups are enabled
- [ ] Error logging is configured
- [ ] Analytics are tracking properly
- [ ] SendGrid webhook is working
- [ ] Rate limiting is active
- [ ] Email templates are tested
- [ ] CSV import is validated
- [ ] Authentication is working
- [ ] Stripe (if using) is configured
- [ ] Landing page is ready
- [ ] Email support is setup

---

## 📈 Post-Launch Monitoring

### Key Metrics to Track

1. **Email Delivery**
   - Bounce rate (target: < 2%)
   - Spam complaints (target: 0)

2. **Engagement**
   - Open rate (track daily)
   - Click rate (track daily)
   - Reply rate (track daily)

3. **System Health**
   - API response time (target: < 200ms)
   - Error rate (target: < 0.1%)
   - Uptime (target: 99.9%)

### Setup Monitoring

1. **Sentry for error tracking:**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Vercel Analytics:**
   - Automatically included in Vercel

3. **SendGrid Analytics:**
   - Go to Analytics in SendGrid dashboard

---

## 🎉 Launch Success!

Once deployed:
1. Share link with friends/beta users
2. Collect feedback
3. Record demo video
4. Post to ProductHunt
5. Share on Twitter/LinkedIn
6. Start building the product based on feedback

---

Last Updated: December 9, 2025
