import Stripe from 'stripe';
import { updateUserSubscription } from '../services/subscriptionService';
import { PlanId } from '../types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Vercel's default body parser needs to be disabled for Stripe's signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read the raw request body
async function getRawBody(req: any) {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    req.on('data', (chunk: any) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err: any) => reject(err));
  });
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`❌ Error message: ${errorMessage}`);
        return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    console.log('✅ Success:', event.id);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const plan = session.metadata?.plan as PlanId;

        if (userId && plan) {
             try {
                console.log(`Updating subscription for user ${userId} to plan ${plan}`);
                await updateUserSubscription(userId, { 
                    plan: plan, 
                    status: 'active', 
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
                });
                console.log(`Subscription updated successfully for user ${userId}.`);
            } catch (error) {
                console.error(`Webhook failed to update subscription for user ${userId}:`, error);
                return res.status(500).json({ error: 'Failed to update subscription in database.' });
            }
        } else {
             console.warn(`Webhook received invalid data: userId=${userId}, plan=${plan}`);
        }
    } else {
        console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
}
