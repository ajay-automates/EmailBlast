# 📋 EmailBlast - Quick Reference Card

**For Daily Use - Keep This Handy**

---

## 🚀 QUICK START (5 Minutes)

### 1. Create Campaign

```
Dashboard → New Campaign
Name: "Founder Outreach - Dec 2025"
Subject: "Quick question about [Company]"
Context: "I help B2B SaaS automate workflows"
Tone: Direct
Daily Limit: 30
```

### 2. Upload Contacts

```
CSV Format:
FirstName,LastName,Email,Company,Position
John,Doe,john@example.com,Acme Inc,CEO
```

### 3. Generate & Send

```
1. Select all contacts
2. Click "Generate" (wait 2-5 min)
3. Preview 1-2 emails
4. Send test to yourself
5. Click "Send" to queue
```

---

## 📊 DAILY CHECKLIST

### Morning (5 min)

- [ ] Check dashboard for new replies
- [ ] Follow up manually with interested prospects
- [ ] Review yesterday's open/click rates

### Afternoon (2 min)

- [ ] Check if queue is processing (should see gradual sends)
- [ ] Monitor for any bounces or errors

### Evening (Optional)

- [ ] Prepare tomorrow's prospect list
- [ ] Clone successful campaigns for next batch

---

## 🔧 COMMON TASKS

### Clone a Campaign

```
Campaign Detail → Clone Button
New Name: "Founder Outreach - Week 2"
Clone Contacts: No (fresh list)
```

### Preview Email

```
Campaign → Contacts → Preview Icon
Or: Send Test Email to yourself
```

### Check Queue Status

```
Campaign → Send Tab
Shows: Pending / Sent / Failed
```

### View Analytics

```
Campaign → Analytics Tab
Metrics: Opens, Clicks, Replies
```

---

## 🚨 TROUBLESHOOTING

### "No emails sending"

1. Check cron job is running (every 15 min)
2. Verify queue has pending emails
3. Check SendGrid API key

### "Emails sending too fast"

1. Check daily_limit in campaign settings
2. Should be 30-50 max
3. Verify cron is running (not manual send)

### "Reply not detected"

1. Check SendGrid Inbound Parse setup
2. Verify webhook URL is correct
3. Test by replying to a test email

### "Unsubscribe link broken"

1. Check NEXT_PUBLIC_URL in .env
2. Should be your production domain
3. Test link before sending

---

## 📈 OPTIMIZATION TIPS

### For Better Open Rates

✅ Send 9-11 AM or 2-4 PM (recipient timezone)  
✅ Keep subject under 50 characters  
✅ Use "Direct" tone for busy executives  
✅ Personalize with company name in subject  

### For Better Reply Rates

✅ Keep email under 100 words  
✅ Single clear CTA (book a call)  
✅ Show value in first sentence  
✅ Use "Friendly" tone for peers  

### For Domain Safety

✅ Start with 20 emails/day  
✅ Increase by 10/day each week  
✅ Never exceed 100/day per domain  
✅ Monitor bounce rate (keep under 2%)  

---

## 🎯 BENCHMARKS

### Good Performance

- Open Rate: 30-50%
- Reply Rate: 5-10%
- Bounce Rate: <2%
- Unsubscribe Rate: <1%

### Red Flags

- Open Rate: <20% → Fix subject lines
- Reply Rate: <2% → Fix email copy
- Bounce Rate: >5% → Clean your list
- Unsubscribe: >3% → Wrong audience

---

## 🔐 SAFETY RULES

### Always

✅ Verify sender email in SendGrid  
✅ Test unsubscribe link before bulk send  
✅ Preview emails before sending  
✅ Respect daily limits  
✅ Follow up manually with replies  

### Never

❌ Send without unsubscribe link  
❌ Email replied/unsubscribed contacts  
❌ Exceed 100 emails/day  
❌ Use purchased email lists  
❌ Send generic templates  

---

## 📞 EMERGENCY CONTACTS

### If Something Breaks

1. **Check Logs:** Vercel Dashboard → Logs
2. **Check Queue:** Supabase → send_queue table
3. **Check SendGrid:** Event History
4. **Pause Sending:** Set daily_limit to 0

### Quick Fixes

- **Stop all sends:** Set campaign status to 'paused'
- **Clear queue:** Delete from send_queue WHERE status='pending'
- **Reset contact:** UPDATE contacts SET replied=false WHERE id='xxx'

---

## 🎬 DEMO SCRIPT (Client Calls)

### 1. Hook (30s)

"We built a custom AI system that sends personalized cold emails at scale. Let me show you..."

### 2. Show Campaign (30s)

"Here's a campaign targeting SaaS founders. We upload a CSV..."

### 3. Show AI Generation (60s)

"AI generates 5 unique variations per contact. Look at this personalization..."

### 4. Show Safety Features (60s)

"Auto-detects replies, stops follow-ups, one-click unsubscribe, daily limits..."

### 5. Show Results (30s)

"30% open rate, 5% reply rate, 3 meetings booked from 100 emails..."

### 6. Close

"We tailor this per client. What's your target audience?"

---

## 📊 WEEKLY REVIEW

### Every Friday

- [ ] Total emails sent this week
- [ ] Total replies received
- [ ] Meetings booked
- [ ] Best performing campaign (clone it!)
- [ ] Worst performing (fix or pause)

### Metrics to Track

```
Week 1: 150 sent, 45 opens (30%), 8 replies (5%), 2 meetings
Week 2: 200 sent, 70 opens (35%), 12 replies (6%), 3 meetings
Week 3: 250 sent, 100 opens (40%), 15 replies (6%), 5 meetings
```

---

## 🚀 SCALING PLAN

### Month 1: Prove It Works

- Send 20-30/day
- Target 1 audience
- Book 5-10 meetings
- Refine copy

### Month 2: Scale Up

- Send 40-50/day
- Target 2-3 audiences
- Book 10-15 meetings
- Clone best campaigns

### Month 3: Automate

- Multiple campaigns running
- 50-100/day total
- 20+ meetings/month
- Hire SDR to handle replies

---

## 💡 PRO TIPS

### Personalization Hacks

- Mention recent company news
- Reference their LinkedIn post
- Compliment their product
- Show you did research

### Subject Line Formulas

- "Quick question about [Company]"
- "[Name], saw your post about [Topic]"
- "Idea for [Company]'s [Department]"
- "Following up on [Event/Post]"

### CTA Best Practices

- "Worth a 15-min call?"
- "Open to a quick chat?"
- "Can I send you a demo?"
- "Interested in learning more?"

---

**Print this and keep it on your desk! 📌**

---

*Last Updated: December 15, 2025*
