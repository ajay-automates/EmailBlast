# 🚀 EmailBlast - AI-Powered Email Automation SaaS

**Production-Ready SaaS Platform**  
**Version:** 2.0 (SaaS Ready)  
**Status:** ✅ Live & Deployed

---

## 📖 Overview

EmailBlast is a professional, full-stack SaaS platform designed for high-conversion cold email outreach. It leverages AI (GPT-4/Claude) to generate personalized email variations, SendGrid for delivery, and Supabase for data management.

### Key Features

* **🤖 AI Personalization:** Generates 5 unique, context-aware email variations per contact.
* **📧 Smart Sending:** Queue-based sending with daily limits, reply detection, and bounce suppression.
* **📊 Real-Time Analytics:** Tracks opens, clicks, replies, and bounces instantly.
* **🛡️ Production Grade:** Includes authentication (Supabase), payments (Stripe), and legal compliance pages.
* **🧪 A/B Testing:** Automatically varies subject lines and content hooks.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
* **Backend:** Next.js API Routes, Node.js
* **Database:** Supabase (PostgreSQL)
* **AI Engine:** Anthropic Claude 3 Haiku / OpenAI
* **Email Infrastructure:** SendGrid
* **Payments:** Stripe
* **Hosting:** Vercel

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites

* Node.js 18+
* npm
* Supabase Account
* SendGrid Account
* Anthropic/OpenAI API Key

### 2. Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# (Populate .env.local with your keys, see below)
```

### 3. Environment Variables

Create a `.env.local` file with the following:

```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# Email (SendGrid)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=you@yourdomain.com

# App URL (Critical for Unsubscribe links)
NEXT_PUBLIC_URL=http://localhost:3000

# Payments (Stripe - Optional for Dev)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Database Setup

Run the following SQL in your Supabase SQL Editor:

1. Run `schema.sql` (Creates core tables)
2. Run `migration-saas-ready.sql` (Adds reply detection & queueing)

### 5. Run Locally

```bash
npm run dev
# Visit http://localhost:3000/dashboard
```

---

## 📦 Deployment Guide (Vercel)

1. **Push to GitHub:** Ensure your repo is up to date.
2. **Import to Vercel:** Select your repository.
3. **Environment Variables:** Add all variables from `.env.local` to Vercel Project Settings.
    * **CRITICAL:** Set `NEXT_PUBLIC_URL` to your production domain (e.g., `https://email-blast.vercel.app`).
    * Add `CRON_SECRET` (random string) for securing cron jobs.
4. **Deploy:** Click "Deploy".

### Post-Deployment Configuration

1. **SendGrid Inbound Parse (For Reply Detection):**
    * Settings -> Inbound Parse -> Add Host & URL.
    * URL: `https://your-domain.vercel.app/api/webhooks/sendgrid-inbound`
    * Check "POST the raw, full MIME message".

2. **Cron Jobs (Queue Processing):**
    * The project includes `vercel.json` for Vercel Cron.
    * It calls `/api/cron/process-queue` every 15 minutes to send queued emails.

---

## 📂 Project Structure

```
src/
├── pages/
│   ├── api/            # Backend API Routes
│   │   ├── auth/       # Authentication (Signup/Login)
│   │   ├── campaigns/  # Campaign CRUD & Sending logic
│   │   ├── cron/       # Scheduled tasks (Queue processing)
│   │   └── webhooks/   # Stripe & SendGrid listeners
│   ├── dashboard/      # Protected App Pages
│   └── index.tsx       # Landing Page
├── lib/                # Shared utilities (Auth, DB, Stripe)
├── components/         # React Components
└── styles/             # Global CSS & Tailwind
```

---

## 🛡️ Operational Guide

### How to Send a Campaign

1. **Create Campaign:** Dashboard -> New Campaign.
2. **Upload Contacts:** CSV format (must include `email`, optional: `first_name`, `company`).
3. **Generate:** Click "Generate" tab. AI will create personalized emails per contact.
4. **Review:** Check the generated emails.
5. **Send:** Click "Send All".
    * *Note:* Emails go to the **Send Queue**.
    * The background Cron Job picks them up every 15m (respecting daily limits).

### Troubleshooting

* **"Failed to add contact":** Check if you are using the real "Sign Up" flow vs. a mock user.
* **Emails not sending:** Check `send_queue` table in Supabase. If status is `pending`, check if Cron Job is running.
* **Unsubscribe links broken:** Verify `NEXT_PUBLIC_URL` is set in Vercel.

---

**Built with ❤️ for High-Performance Outreach**
