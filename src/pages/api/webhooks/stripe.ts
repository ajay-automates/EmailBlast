import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    if (!sig) {
        return res.status(400).json({ error: 'Missing stripe signature' });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            buf,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;

                // Update user plan in database
                const { error } = await supabase
                    .from('users')
                    .update({
                        plan: session.metadata.plan,
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', session.metadata.userId);

                if (error) {
                    console.error('Failed to update user plan:', error);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;

                // Update subscription status
                const { error } = await supabase
                    .from('users')
                    .update({
                        stripe_subscription_status: subscription.status,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_subscription_id', subscription.id);

                if (error) {
                    console.error('Failed to update subscription:', error);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;

                // Downgrade to free plan
                const { error } = await supabase
                    .from('users')
                    .update({
                        plan: 'free',
                        stripe_subscription_id: null,
                        stripe_subscription_status: 'canceled',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_subscription_id', subscription.id);

                if (error) {
                    console.error('Failed to downgrade user:', error);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
}
