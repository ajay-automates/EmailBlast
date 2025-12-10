# SendGrid Email Setup Guide

## Issue

Emails are not being sent because SendGrid is not properly configured.

## Required Environment Variables

You need to add these to your `.env.local` file:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your_verified_email@yourdomain.com
```

## Step-by-Step Setup

### 1. Create a SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free tier)

### 2. Get Your API Key

1. Log in to SendGrid
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "EmailBlast")
5. Select **Full Access** permissions
6. Click **Create & View**
7. **Copy the API key** (you won't be able to see it again!)
8. Add it to `.env.local` as `SENDGRID_API_KEY`

### 3. Verify Your Sender Email

1. In SendGrid, go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - From Name: Your Name or Company
   - From Email Address: The email you want to send from
   - Reply To: Same or different email
   - Company Address, City, State, ZIP, Country
4. Click **Create**
5. Check your email inbox and click the verification link
6. Once verified, add this email to `.env.local` as `SENDGRID_FROM_EMAIL`

### 4. Update Your .env.local File

Your `.env.local` should look like this:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI
ANTHROPIC_API_KEY=your_anthropic_key

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=yourname@yourdomain.com

# Auth
JWT_SECRET=your_jwt_secret
```

### 5. Restart Your Dev Server

After updating `.env.local`:

1. Stop the dev server (Ctrl+C)
2. Run `npm run dev` again
3. Try sending emails again

## Testing

1. Go to your campaign's send page
2. Select some email variations
3. Click "Send Emails"
4. You should now see detailed error messages if something is wrong
5. If configured correctly, emails will be sent!

## Common Issues

### "SendGrid API key not configured"

- Make sure `SENDGRID_API_KEY` is in your `.env.local` file
- Restart your dev server after adding it

### "SendGrid sender email not configured"

- Make sure `SENDGRID_FROM_EMAIL` is in your `.env.local` file
- Restart your dev server after adding it

### "The from address does not match a verified Sender Identity"

- You need to verify your sender email in SendGrid
- Go to Settings → Sender Authentication → Verify a Single Sender
- Check your email for the verification link

### Emails still not sending

- Check the browser console for error messages
- Check the terminal/server logs for detailed SendGrid errors
- Make sure you're using a valid email format
- Verify your SendGrid account is active

## Production Deployment

For Vercel deployment, add these environment variables in your Vercel project settings:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`
4. Redeploy your application
