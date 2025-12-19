# How to Get Real Verified Emails (Free)

The system is currently in **Safe Mode** (using simulated emails like `@example-demo.com`) to prevent accidental spam.

To unlock **Real Verified Emails**, follow these steps to add a free Hunter.io key.

## Step 1: Get Your Free API Key

1. Go to [https://hunter.io/users/sign_up](https://hunter.io/users/sign_up)
2. Create a free account (includes **25 free searches/month**).
3. Go to the **API** section: [https://hunter.io/api-keys](https://hunter.io/api-keys)
4. Copy your **API Key**.

## Step 2: Add Key to Project

1. Open the file `.env.local` in your project folder.
2. Add this line at the bottom:

    ```
    HUNTER_API_KEY=your_api_key_here
    ```

3. Save the file.

## Step 3: Restart Server

For the changes to take effect, you must restart the server:

1. Stop the current server (Ctrl+C in terminal).
2. Run `npm run dev`.

## ✅ Result

- The system will now use Hunter.io to find **real, verified email addresses** for the companies it finds.
- If you run out of free credits (25/mo), it will gracefully fall back to simulated emails.
