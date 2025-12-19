# Production Deployment Checklist

To "Share to PROD" with **Real Emails & Real Sending**, you must update your Vercel Project Settings.

## 1. Environment Variables

Go to **Vercel Dashboard** -> **Settings** -> **Environment Variables** and add these:

| Variable | Value (Copy from your `.env.local` or account) | Purpose |
| :--- | :--- | :--- |
| `HUNTER_API_KEY` | `cba25e2746a4679b4ae3a99035b4ba60b13a8591` | **New!** Finds real verified emails. |
| `ANTHROPIC_API_KEY` | (Your Claude Key) | Generates the email content. |
| `SENDGRID_API_KEY` | (Your SendGrid Key) | Sends the actual emails. |
| `SENDGRID_FROM_EMAIL` | (Your Verified Sender Email) | The "From" address (must be verified in SendGrid). |
| `NEXT_PUBLIC_SUPABASE_URL` | (Your Supabase URL) | Database connection. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Your Supabase Anon Key) | Database connection. |
| `SUPABASE_SERVICE_KEY` | (Your Supabase Service Key) | Database admin access. |

> [!IMPORTANT]
> **Real Sending**: Ensure `SENDGRID_FROM_EMAIL` matches a **Verified Sender** in your SendGrid account. We have set your personal email as the "Reply-To", so people will reply directly to you!

## 2. Deploy

After adding these variables:

1. Go to **Deployments** in Vercel.
2. Click **Redeploy** on the latest commit (or push a new commit to trigger it).
