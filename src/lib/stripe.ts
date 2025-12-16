import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-08-16',
});

export const STRIPE_PLANS = {
    free: {
        name: 'Free',
        price: 0,
        emailLimit: 50,
        features: [
            'AI email generation',
            'Email sending',
            'Open tracking',
            'Analytics dashboard',
        ],
    },
    pro: {
        name: 'Pro',
        price: 1000, // ₹1,000 in paise
        priceId: process.env.STRIPE_PRO_PRICE_ID || '',
        emailLimit: 5000,
        features: [
            'Everything in Free',
            'Click tracking',
            'Reply detection',
            'Follow-up sequences',
            'API access',
        ],
    },
    business: {
        name: 'Business',
        price: 5000, // ₹5,000 in paise
        priceId: process.env.STRIPE_BUSINESS_PRICE_ID || '',
        emailLimit: -1, // Unlimited
        features: [
            'Everything in Pro',
            'Unlimited emails',
            'Dedicated support',
            'Custom domains',
            'Team features',
            'SLA guarantee',
        ],
    },
};
