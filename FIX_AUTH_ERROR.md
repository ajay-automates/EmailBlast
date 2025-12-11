# 🔧 Fix Authentication Error

## The Problem

NextAuth requires a `NEXTAUTH_SECRET` environment variable that's currently missing.

## Quick Fix (2 minutes)

### Step 1: Generate Secret

Open PowerShell and run:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output (it will be a long random string).

### Step 2: Add to .env.local

Open the file `.env.local` in your project root and add this line:

```env
NEXTAUTH_SECRET=paste-your-generated-secret-here
```

### Step 3: Restart Server

1. Stop the current server (Ctrl+C in terminal)
2. Run: `npm run dev -- -p 5000`
3. Refresh your browser

## OR Use This Pre-Generated Secret

Add this to your `.env.local` file:

```env
NEXTAUTH_SECRET=YourSecretKeyHere123456789012345678901234567890AB
```

## After Adding the Secret

1. Save `.env.local`
2. Restart the dev server
3. Go to <http://localhost:5000/auth/signup>
4. Create an account
5. Sign in!

---

**The server will automatically pick up the new environment variable after restart.**
