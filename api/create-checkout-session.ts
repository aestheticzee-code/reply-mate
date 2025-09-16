import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const planToPriceIdMap: Record<string, string> = {
    pro: process.env.STRIPE_PRO_PRICE_ID || '',
    team: process.env.STRIPE_TEAM_PRICE_ID || ''
};

// Helper to read the request body, as Vercel's default parser might not work for webhooks
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

    try {
        const { userId, email, plan } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const priceId = planToPriceIdMap[plan];
        
        if (!userId || !email || !plan || !priceId) {
            return res.status(400).json({ message: 'Missing required parameters: userId, email, plan.' });
        }
        
        const appUrl = req.headers.origin || 'http://localhost:3000';

        // Create a Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${appUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/pricing`,
            // Pass the user's internal ID to the session so we can identify them in the webhook
            client_reference_id: userId,
            // Pre-fill the customer's email
            customer_email: email,
             // Add metadata to the session for the webhook
            metadata: {
                plan: plan
            }
        });

        if (!session.id) {
            throw new Error('Failed to create Stripe session.');
        }

        return res.status(200).json({ sessionId: session.id });

    } catch (error) {
        console.error('API Error in /api/create-checkout-session:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        res.status(500).json({ message: errorMessage, error: error });
    }
}
