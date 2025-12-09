# EmailBlast Quick Reference Guide

## 📁 Project Structure at a Glance

```
src/
├── pages/
│   ├── api/
│   │   ├── campaigns/
│   │   │   ├── index.ts          ✅ GET/POST campaigns
│   │   │   ├── [id].ts           ✅ GET/PUT/DELETE specific
│   │   │   ├── [id]/
│   │   │   │   ├── contacts.ts   ✅ POST CSV upload
│   │   │   │   ├── generate.ts   ✅ POST email generation
│   │   │   │   ├── send.ts       ✅ POST send emails
│   │   │   │   └── analytics.ts  ✅ GET metrics
│   │   └── webhooks/
│   │       └── sendgrid.ts       ✅ POST webhook events
│   └── dashboard/
│       ├── index.tsx             ✅ Campaign list
│       └── [id]/
│           ├── index.tsx         ✅ Campaign detail
│           ├── upload.tsx        ✅ CSV upload UI
│           ├── generate.tsx      ✅ Email generation UI
│           ├── send.tsx          ✅ Send confirmation UI
│           └── analytics.tsx     ✅ Real-time metrics
├── lib/
│   ├── supabase.ts               ✅ DB client
│   └── auth.ts                   ✅ Auth utilities
└── styles/
    └── globals.css               ✅ Tailwind styles

✅ = Completed
```

## 🔑 Environment Variables

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# AI
OPENAI_API_KEY=

# Email
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=your-verified-email@domain.com

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_PRO=
STRIPE_PRICE_BUSINESS=

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

## 🛠️ Common Commands

```bash
# Development
npm run dev                    # Start dev server

# Build & Deploy
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run linter

# Deployment
vercel                        # Deploy to Vercel
vercel --prod                 # Deploy to production
```

## 📝 API Response Examples

### Create Campaign
```typescript
POST /api/campaigns
{
  "name": "My Campaign",
  "subjectLine": "Hi {firstName}",
  "context": "Software engineers at startups"
}

// Response
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "My Campaign",
  "subject_line": "Hi {firstName}",
  "context": "...",
  "status": "draft",
  "created_at": "2025-12-09T..."
}
```

### Upload CSV
```typescript
POST /api/campaigns/[id]/contacts
Content-Type: application/json
{
  "csvData": "base64-encoded-csv"
}

// Response
{
  "imported": 50,
  "message": "Successfully imported 50 contacts"
}
```

### Generate Variations
```typescript
POST /api/campaigns/[id]/generate
{
  "contactIds": ["uuid1", "uuid2"]
}

// Response
{
  "generated": 10,
  "message": "Generated 10 email variations"
}
```

### Send Emails
```typescript
POST /api/campaigns/[id]/send
{
  "variationIds": ["var-uuid1", "var-uuid2"]
}

// Response
{
  "sent": 2,
  "failed": 0,
  "message": "Sent 2 emails successfully"
}
```

### Get Analytics
```typescript
GET /api/campaigns/[id]/analytics

// Response
{
  "totalSent": 50,
  "opened": 10,
  "clicked": 5,
  "replied": 2,
  "bounced": 1,
  "openRate": "20.0%",
  "clickRate": "10.0%",
  "replyRate": "4.0%",
  "bounceRate": "2.0%"
}
```

## 🗄️ Database Tables Quick Reference

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| users | User accounts | id, email, plan, stripe_customer_id |
| campaigns | Email campaigns | id, user_id, name, subject_line, context, status |
| contacts | Email contacts | id, campaign_id, email, first_name, last_name, company, position |
| email_variations | Generated emails | id, contact_id, variation_number (1-5), subject, body |
| email_logs | Email events | id, variation_id, status (sent/opened/clicked/replied/bounced), timestamps |
| campaign_analytics | Campaign stats | id, campaign_id, total_sent, total_opened, total_clicked, open_rate, click_rate |

## 🧪 Testing API Endpoints

### Using cURL

```bash
# Create campaign
curl -X POST http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","subjectLine":"Hi","context":"test"}'

# Get campaigns
curl http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get analytics
curl http://localhost:3000/api/campaigns/CAMPAIGN_ID/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import → Paste raw text:
```json
{
  "info": {
    "name": "EmailBlast API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Campaign",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/campaigns",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "body": {
          "raw": "{\"name\":\"Test\",\"subjectLine\":\"Hi\",\"context\":\"test\"}"
        }
      }
    }
  ]
}
```

## 🐛 Debugging Tips

### Check API Response
```typescript
// In your page component
const res = await fetch('/api/campaigns', {
  headers: { Authorization: `Bearer ${token}` },
})
const data = await res.json()
console.log('Status:', res.status)
console.log('Data:', data)
```

### View Database
```bash
# In Supabase dashboard
# SQL Editor → run this:
SELECT * FROM campaigns LIMIT 10;
SELECT COUNT(*) FROM email_logs GROUP BY status;
SELECT * FROM contacts WHERE campaign_id = 'your-id';
```

### Monitor SendGrid
1. Go to SendGrid dashboard
2. Analytics → Overview
3. Monitor opens, clicks, bounces
4. Check Event History for failures

### Check OpenAI Usage
1. Go to [platform.openai.com](https://platform.openai.com)
2. Click on your account
3. Usage → View usage statistics

## 🚀 Performance Optimization

### Database Queries
```typescript
// BAD: N+1 query problem
const campaigns = await supabase.from('campaigns').select()
for (const campaign of campaigns) {
  const analytics = await supabase
    .from('campaign_analytics')
    .select()
    .eq('campaign_id', campaign.id)
}

// GOOD: Use joins
const campaigns = await supabase
  .from('campaigns')
  .select('*, analytics:campaign_analytics(*)')
```

### Email Generation
```typescript
// BAD: Sequential generation
for (const contact of contacts) {
  const response = await openai.chat.completions.create(...)
}

// GOOD: Batch with reasonable concurrency
const batches = chunk(contacts, 10)
for (const batch of batches) {
  await Promise.all(batch.map(contact => generateEmail(contact)))
}
```

## 📚 Important Files to Know

| File | Purpose |
|------|---------|
| `schema.sql` | Database structure |
| `.env.local` | Environment variables |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.js` | Styling configuration |
| `README.md` | Project documentation |
| `PROGRESS.md` | Development status |
| `DEPLOYMENT.md` | Deployment guide |

## 🔐 Authentication Flow

```
User clicks login
  ↓
Send credentials to /api/auth/login
  ↓
Verify credentials in Supabase
  ↓
Return JWT token to frontend
  ↓
Store token in localStorage
  ↓
Include token in all API requests: Authorization: Bearer {token}
  ↓
Backend verifies token with getAuthUser()
```

## 📦 Dependencies at a Glance

| Package | Purpose | Version |
|---------|---------|---------|
| next | Framework | 14.0+ |
| @supabase/supabase-js | Database client | 2.38+ |
| openai | AI API | 4.24+ |
| @sendgrid/mail | Email API | 8.1+ |
| stripe | Payments | 13.10+ |
| tailwindcss | Styling | 3.3+ |
| typescript | Type checking | 5.0+ |

## 🎯 Quick Implementation Guide

### Add a New API Endpoint

```typescript
// 1. Create file: src/pages/api/campaigns/[id]/new-feature.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') return res.status(405).end()
    
    const user = await getAuthUser(req)
    const { id } = req.query
    
    // Your logic here
    
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
```

### Add a New Frontend Page

```typescript
// 1. Create file: src/pages/dashboard/new-page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import '../../styles/globals.css'

export default function NewPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/endpoint', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setData(await res.json())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Your content */}
      </div>
    </div>
  )
}
```

## 🎬 Demo Script Timing

```
Total: ~5 minutes

0:00-0:15  Hook ("AI tool generated 50 emails, got 5 replies")
0:15-1:00  Create campaign & settings
1:00-2:00  Upload CSV contacts
2:00-3:00  Generate email variations
3:00-4:00  Send emails & tracking
4:00-5:00  Show analytics, CTA to waitlist
```

## 💡 Pro Tips

1. **Use Postman or Insomnia** to test APIs before using in frontend
2. **Enable SendGrid webhook logging** to debug delivery issues
3. **Check OpenAI usage daily** to avoid surprise bills
4. **Use Supabase RLS** to prevent unauthorized data access
5. **Add error boundaries** to your React components
6. **Test email generation** with a small batch first
7. **Monitor Vercel logs** for production errors
8. **Keep API keys in environment variables only**
9. **Use TypeScript** for type safety
10. **Version your API** (e.g., /api/v1/campaigns)

## 🆘 Getting Help

1. Check error logs in console
2. Review API responses in Network tab
3. Check Supabase dashboard for DB errors
4. Check SendGrid Event History
5. Monitor Vercel deployment logs
6. Read error messages carefully (they usually tell you what's wrong)

---

**Build date:** December 9, 2025  
**Last updated:** December 9, 2025  
**Status:** Foundation Complete ✅
