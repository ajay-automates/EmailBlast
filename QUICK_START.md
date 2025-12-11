# 🚀 EmailBlast - Quick Setup Guide

## ⚡ Get Running in 10 Minutes

### Step 1: Install Dependencies (if not done)

```bash
npm install
```

### Step 2: Setup Environment Variables

Create/update `.env.local` with these values:

```env
# === REQUIRED: Database (Supabase) ===
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# === REQUIRED: AI (OpenAI) ===
OPENAI_API_KEY=sk-your-openai-key-here

# === REQUIRED: Email (SendGrid) ===
SENDGRID_API_KEY=SG.your-sendgrid-key-here

# === REQUIRED: Authentication (NextAuth) ===
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=GENERATE_THIS_NOW

# === REQUIRED: Payments (Stripe) ===
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_PRO_PRICE_ID=price_your-pro-price-id
STRIPE_BUSINESS_PRICE_ID=price_your-business-price-id
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### Step 3: Generate NEXTAUTH_SECRET

Run this command and copy the output:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Paste the result as `NEXTAUTH_SECRET` in `.env.local`

### Step 4: Update Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Add Stripe columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT DEFAULT 'inactive';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id);
```

### Step 5: Setup Stripe (Optional - for payments)

1. Go to <https://stripe.com> and create account
2. Create two products:
   - **Pro Plan**: ₹1,000/month recurring
   - **Business Plan**: ₹5,000/month recurring
3. Copy the Price IDs and add to `.env.local`
4. Get your Secret Key from Stripe Dashboard
5. Setup webhook (after deploying):
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Step 6: Run Development Server

```bash
npm run dev
```

Open <http://localhost:3000>

### Step 7: Test the App

1. **Landing Page**: <http://localhost:3000>
2. **Sign Up**: <http://localhost:3000/auth/signup>
3. **Login**: <http://localhost:3000/auth/login>
4. **Dashboard**: <http://localhost:3000/dashboard>
5. **Settings**: <http://localhost:3000/dashboard/settings>

---

## ✅ Quick Test Checklist

- [ ] Landing page loads
- [ ] Can create account
- [ ] Can log in
- [ ] Can create campaign
- [ ] Can upload CSV
- [ ] Can generate emails
- [ ] Can send emails
- [ ] Can view analytics
- [ ] Can access settings
- [ ] Can log out

---

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 2. Go to vercel.com
# 3. Import your GitHub repo
# 4. Add all environment variables from .env.local
# 5. Update NEXTAUTH_URL to your production URL
# 6. Deploy!
```

### Option 2: Other Platforms

The app works on any platform that supports Next.js:

- Netlify
- Railway
- Render
- AWS Amplify

---

## 🔧 Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### "NEXTAUTH_SECRET is not defined"

```bash
# Generate a new secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Add to .env.local
```

### "Cannot connect to Supabase"

- Check your Supabase URL and keys
- Make sure Supabase project is active
- Verify network connection

### "Emails not sending"

- Verify sender email in SendGrid
- Check SENDGRID_API_KEY is correct
- Ensure API key has "Mail Send" permission

### "Payment not working"

- Verify Stripe keys are in test mode
- Check price IDs are correct
- Ensure webhook is configured

---

## 📚 Documentation

- **Full Status**: See `FINAL_COMPLETION_REPORT.md`
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md`
- **Auth Setup**: See `AUTH_SETUP.md`

---

## 🎯 What's Next?

1. **Test Everything**: Go through all features
2. **Customize**: Update branding, colors, copy
3. **Deploy**: Push to production
4. **Launch**: Share with users
5. **Iterate**: Collect feedback and improve

---

## 💡 Pro Tips

- Use Stripe test mode until you're ready to accept real payments
- Start with the free plan to test the full flow
- Monitor Vercel logs for any errors
- Check SendGrid event history for email delivery status
- Use Supabase dashboard to view database records

---

## 🆘 Need Help?

Check these resources:

- Next.js Docs: <https://nextjs.org/docs>
- Supabase Docs: <https://supabase.com/docs>
- Stripe Docs: <https://stripe.com/docs>
- SendGrid Docs: <https://docs.sendgrid.com>
- NextAuth Docs: <https://next-auth.js.org>

---

**You're all set! Start the dev server and test your app! 🚀**

```bash
npm run dev
```

Then go to: <http://localhost:3000>
