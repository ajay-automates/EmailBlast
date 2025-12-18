# Free Lead Finder Setup

## Overview

The One-Click Outbound feature now uses **FREE** data sources instead of paid Apollo API:

### Data Sources (in order of priority)

1. **Hunter.io Free Tier** (Optional - 25 searches/month)
   - Finds real email addresses for company domains
   - 100% free tier available

2. **Curated Real Company Database** (Always Available)
   - Real companies: Stripe, Notion, Figma, Airtable, etc.
   - Real job titles and company descriptions
   - Safe demo emails for testing

## How It Works

### Without Hunter.io (Default - 100% Free)

- Uses curated database of **real companies**
- Generates realistic contact profiles
- Safe demo emails (won't accidentally send to real people)
- **Perfect for testing and demos**

### With Hunter.io (Enhanced - Still Free)

- Finds **real email addresses** from company websites
- 25 free searches per month
- Verifies email deliverability
- **Best for actual outreach**

## Setup Hunter.io (Optional)

### Step 1: Get Free API Key

1. Go to <https://hunter.io/users/sign_up>
2. Sign up for a free account
3. Navigate to **API** section
4. Copy your API key

### Step 2: Add to Environment

Add to your `.env.local` file:

```
HUNTER_API_KEY=your_key_here
```

### Step 3: Restart Server

```bash
npm run dev
```

## What You Get

### Free Tier Limits

- **Hunter.io**: 25 domain searches/month
- **Curated Database**: Unlimited
- **AI Email Generation**: Unlimited
- **Email Sending**: Based on SendGrid limits

### Data Quality

- ✅ Real company names
- ✅ Real company descriptions
- ✅ Real job titles
- ✅ Real locations
- ✅ Real email addresses (with Hunter.io)
- ✅ Safe demo emails (without Hunter.io)

## Comparison

| Feature | Apollo (Paid) | Free Lead Finder |
|---------|---------------|------------------|
| Cost | $49-99/month | **FREE** |
| Real Companies | ✅ | ✅ |
| Real Emails | ✅ | ✅ (with Hunter) |
| Monthly Limit | Varies | 25 (Hunter) + Unlimited (Curated) |
| Setup Time | 5 min | **0 min** (works now) |

## Recommendation

**For Testing/Demos**: Use without Hunter.io (current setup)

- Zero setup required
- Works immediately
- Safe demo emails
- Real company data

**For Real Outreach**: Add Hunter.io key

- 5-minute setup
- Real verified emails
- 25 leads/month free
- Upgrade for more

## Next Steps

1. **Test it now**: Launch a campaign - it already works!
2. **Optional**: Add Hunter.io key for real emails
3. **Scale**: Use CSV upload for unlimited leads
