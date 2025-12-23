# Company Profile & Email Templates - Setup Guide

## ✅ What Was Added

### 1. **Company Profile System**

- Comprehensive business profile page where users fill in their details once
- AI-powered website analyzer that extracts business information automatically
- All profile data is used to personalize email generation

### 2. **Email Templates**

- Pre-built industry-specific email templates
- Templates for: AI/Automation, SaaS, Marketing Agency, Restaurant, E-commerce, Real Estate, Consulting, and more
- Follow-up and break-up email templates

### 3. **Enhanced Email Generation**

- AI now uses full company profile for personalization
- Includes: tagline, services, key results, calendar link, phone number
- Automatic placeholder replacement for all variables

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

In your Supabase SQL Editor, run:

```sql
-- Copy and paste the entire contents of migration-company-profile.sql
```

This creates:

- `company_profiles` table
- `email_templates` table with pre-populated templates

### Step 2: Verify Deployment

The code has been pushed to GitHub. Vercel will automatically deploy it.

Wait ~2 minutes for deployment to complete.

### Step 3: Fill Out Your Company Profile

1. Go to: `https://your-domain.vercel.app/dashboard/profile`
2. **Quick Start Option:**
   - Enter your website URL
   - Click "✨ Analyze Website"
   - AI will extract your business info automatically
   - Review and edit the extracted data
3. **Manual Option:**
   - Fill in all fields manually
4. Click "💾 Save Profile"

---

## 📋 Company Profile Fields

### Basic Information

- Company Name *
- Industry *
- Company Size
- Website URL

### Sender Information (appears in emails)

- Your Name *
- Your Title
- Email *
- Phone
- LinkedIn Profile

### Business Details

- Tagline (one-liner about your business)
- Description (2-3 sentences)
- Services You Offer (list)
- Target Audience
- What Makes You Different

### Results & Proof

- Key Results (e.g., "Clients save 10+ hours/week")
- Add multiple results for credibility

### Email Preferences

- Tone (professional, friendly, direct, casual)
- Calendar Link (Calendly, Cal.com, etc.)
- Default Call-to-Action

---

## 🎯 How It Works

### Before (Old Way)

```
AI Prompt:
- Recipient: John Doe
- Company: ABC Corp
- Sender: [Your Name]
```

### After (New Way)

```
AI Prompt:
- Recipient: John Doe at ABC Corp
- Sender: Ajay Nelavetla, Lead Automation Architect
- Company: AI Automation Consultancy
- Tagline: We design and build AI systems for modern businesses
- Services:
  - AI-Powered Email Outreach
  - Workflow Automation
  - Custom AI Integrations
- Key Results:
  - Clients save 10-15 hours per week
  - 3x faster lead response time
- Calendar: https://calendly.com/ajay
```

**Result:** Much richer, more personalized emails with real proof points!

---

## 📧 Email Template Variables

All these variables are automatically replaced in generated emails:

| Variable | Source | Example |
|----------|--------|---------|
| `{{firstName}}` | CSV Upload | "John" |
| `{{lastName}}` | CSV Upload | "Doe" |
| `{{company}}` | CSV Upload | "ABC Corp" |
| `{{position}}` | CSV Upload | "CEO" |
| `{{senderName}}` | Company Profile | "Ajay Nelavetla" |
| `{{senderTitle}}` | Company Profile | "Lead Automation Architect" |
| `{{senderEmail}}` | Company Profile | "<ajay@company.com>" |
| `{{senderPhone}}` | Company Profile | "+1 (857) 576-1177" |
| `{{companyName}}` | Company Profile | "AI Automation Consultancy" |
| `{{tagline}}` | Company Profile | "We design and build AI systems..." |
| `{{services}}` | Company Profile | List of services |
| `{{keyResults}}` | Company Profile | List of results/proof |
| `{{calendarLink}}` | Company Profile | "<https://calendly.com/>..." |

---

## 🧪 Testing

1. **Fill out your profile** at `/dashboard/profile`
2. **Create a new campaign**
3. **Add a test contact** (yourself)
4. **Generate emails**
5. **Check the generated email** - it should include:
   - Your real name (not "[Your Name]")
   - Your company tagline
   - Your services (if mentioned in context)
   - Your calendar link (if appropriate)
   - Your key results/proof points

---

## 🎨 Using Email Templates (Coming Soon)

The templates are in the database but not yet integrated into the UI. Next steps:

1. Add a "Templates" tab to the campaign creation flow
2. Let users select a template based on their industry
3. Pre-fill the campaign context with the template
4. User can customize before generating

---

## 🐛 Troubleshooting

**Q: Website analyzer isn't working**

- Make sure your website is publicly accessible
- Try with `https://` prefix
- If it fails, just fill in the fields manually

**Q: Emails still have placeholders**

- Make sure you've filled out and saved your Company Profile
- The profile must be saved BEFORE generating emails
- Try regenerating emails after saving profile

**Q: Profile page not loading**

- Check if you're logged in
- Verify the database migration ran successfully
- Check browser console for errors

---

## ✨ What's Next?

Your emails will now be:

- ✅ Fully personalized with YOUR business details
- ✅ Include YOUR proof points and results
- ✅ Have YOUR calendar link for easy booking
- ✅ Signed with YOUR real name and title

**No more generic placeholders. Every email is ready to send!**
