import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Icons } from '../constants';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/common/Toast';

// FIX: The `Stripe` type from the 'stripe' node package is for backend use.
// We define a minimal type for the Stripe.js client-side object.
interface Stripe {
  redirectToCheckout(options: {
    sessionId: string;
  }): Promise<{ error?: { message: string } }>;
}

// FIX: Add type definition for window.Stripe to avoid TypeScript errors.
// The Stripe.js script is loaded externally, so we need to declare its presence on the window object.
declare global {
  interface Window {
    Stripe?: (publicKey: string) => Stripe;
  }
}


const PricingTier: React.FC<{ title: string; price: string; features: string[]; isFeatured?: boolean; onSelect: () => void; isLoading: boolean; actionText: string }> = ({ title, price, features, isFeatured = false, onSelect, isLoading, actionText }) => (
    <Card className={`flex flex-col ${isFeatured ? 'border-2 border-indigo-500 scale-105' : ''}`}>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="my-4">
            <span className="text-4xl font-extrabold">${price}</span>
            <span className="text-slate-500">/mo</span>
        </p>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400 flex-grow">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1 flex-shrink-0">{Icons.check}</span>
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <Button onClick={onSelect} isLoading={isLoading} className="mt-6 w-full" variant={isFeatured ? 'primary' : 'secondary'}>
            {actionText}
        </Button>
    </Card>
);


const PricingPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);
    const [stripe, setStripe] = useState<Stripe | null>(null);

    useEffect(() => {
        // Stripe is available on the window object because we added the script in index.html
        if (window.Stripe) {
            // Use the publishable key from your .env.example (or environment)
            const stripeInstance = window.Stripe(process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51S3AX7HTXEqdIcmNaTkizDXSeQbwhhUIIirYT59JyRdeEWXW3QUOIrANmn4g5cR6cgp8y0j7XAIwtqQIDsxlrahf00RspGue6D');
            setStripe(stripeInstance);
        }
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ id: Date.now(), message, type });
    };

    const handleSelectPlan = async (plan: string) => {
        if (!isAuthenticated || !user) {
            navigate('/auth');
            return;
        }
        if (!stripe) {
            showToast('Stripe is not ready. Please wait a moment.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, email: user.email, plan }),
            });
            const data = await response.json();

            if (response.ok) {
                const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
                if (error) {
                    throw new Error(error.message);
                }
            } else {
                throw new Error(data.message || 'Failed to create checkout session');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred';
            showToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
                    Choose the plan that's right for you
                </h1>
                <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
                    Simple, transparent pricing. No hidden fees.
                </p>
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
                <PricingTier
                    title="Hobby"
                    price="0"
                    features={['10 Generations/month', 'Standard Support', 'Access to all generators']}
                    onSelect={() => navigate('/auth')}
                    isLoading={false}
                    actionText={isAuthenticated ? 'Current Plan' : 'Get Started'}
                />
                <PricingTier
                    title="Pro"
                    price="19"
                    features={['2,000 Generations/month', 'Priority Support', 'Access to new features first']}
                    isFeatured={true}
                    onSelect={() => handleSelectPlan('pro')}
                    isLoading={isLoading}
                    actionText="Upgrade to Pro"
                />
                 <PricingTier
                    title="Team"
                    price="49"
                    features={['Unlimited Generations', 'Dedicated Support', 'Team Collaboration Tools']}
                    onSelect={() => handleSelectPlan('team')}
                    isLoading={isLoading}
                    actionText="Upgrade to Team"
                />
            </div>
             <p className="text-center text-sm text-slate-500 mt-8">
                All plans renew monthly. You can cancel your subscription at any time from your dashboard.
            </p>

            <div className="mt-20 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white">Frequently Asked Questions</h2>
                <div className="mt-8 divide-y divide-slate-200 dark:divide-slate-700">
                    <div className="py-6">
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Can I cancel anytime?</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">Yes, you can cancel your subscription at any time from your dashboard. Your access will continue until the end of your current billing period, and you won't be charged again.</p>
                    </div>
                    <div className="py-6">
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-400">Do unused generations roll over?</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">No, your generation quota resets at the start of each billing cycle. Unused generations do not roll over to the next month. This allows us to keep our pricing simple and affordable.</p>
                    </div>
                    <div className="py-6">
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">What payment methods do you accept?</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">We accept all major credit cards, including Visa, Mastercard, and American Express. All payments are processed securely through our payment partner, Stripe.</p>
                    </div>
                </div>
            </div>

        </div>
        </>
    );
};

export default PricingPage;
