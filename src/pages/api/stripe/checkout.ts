import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { priceId } = req.body;
    const user = session.user;

    try {
        // 1. Check if user already has a stripe_customer_id in public.users
        const { data: userData } = await supabase
            .from('users')
            .select('stripe_customer_id, email')
            .eq('id', user.id)
            .single();

        let customerId = userData?.stripe_customer_id;

        // 2. If not, create a new customer in Stripe
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.id,
                },
            });
            customerId = customer.id;

            // Save customer ID to Supabase
            await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

        // 3. Create Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/dashboard`,
            metadata: {
                userId: user.id,
            },
        });

        res.status(200).json({ sessionId: checkoutSession.id });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Error creating checkout session' });
    }
}
