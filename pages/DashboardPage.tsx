// Fix: Create the DashboardPage component which was previously missing.
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSubmissionsForUser } from '../services/submissionService';
// FIX: The `Subscription` type is exported from `../types` not `../services/subscriptionService`.
import { getUserSubscription, cancelSubscription, reactivateSubscription } from '../services/subscriptionService';
import { Submission, Subscription } from '../types';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ shortReplies: 0, viralTweets: 0, total: 0 });
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isSubLoading, setIsSubLoading] = useState(true);
    const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);


    useEffect(() => {
        if (user) {
            setIsLoading(true);
            setIsSubLoading(true);
            
            const fetchSubmissions = getSubmissionsForUser(user.id)
                .then(data => {
                    setSubmissions(data);
                    const shortReplies = data.filter(s => s.type === 'short-reply').length;
                    const viralTweets = data.filter(s => s.type === 'viral-tweet').length;
                    setStats({
                        shortReplies,
                        viralTweets,
                        total: data.length
                    });
                })
                .catch(err => console.error("Failed to load dashboard data:", err))
                .finally(() => setIsLoading(false));

            const fetchSubscription = getUserSubscription(user.id)
                .then(setSubscription)
                .catch(err => {
                    console.error("Failed to load subscription:", err);
                    showToast('Could not load subscription details.', 'error');
                })
                .finally(() => setIsSubLoading(false));

            Promise.all([fetchSubmissions, fetchSubscription]);
        }

        // Check for successful payment redirect from Stripe
        if (searchParams.get('payment') === 'success') {
            showToast('Payment Successful! Your plan has been updated.');
             // Clean the URL
            navigate('/dashboard', { replace: true });
        }

    }, [user, searchParams, navigate]);
    
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ id: Date.now(), message, type });
    };

    const handleCancel = async () => {
        if (user && window.confirm('Are you sure you want to cancel? Your access will continue until the end of the current period.')) {
            try {
                await cancelSubscription(user.id);
                setSubscription(prev => prev ? { ...prev, status: 'canceled' } : null);
                showToast('Subscription canceled successfully.');
            } catch (error) {
                showToast('Failed to cancel subscription.', 'error');
            }
        }
    };

    const handleReactivate = async () => {
        if (user) {
            try {
                await reactivateSubscription(user.id);
                setSubscription(prev => prev ? { ...prev, status: 'active' } : null);
                showToast('Subscription reactivated!');
            } catch (error) {
                 showToast('Failed to reactivate subscription.', 'error');
            }
        }
    };

    const renderSubscriptionCard = () => {
        if (isSubLoading) return <Card className="flex justify-center items-center"><Spinner /></Card>;
        if (!subscription) return <Card><p>Could not load subscription details.</p></Card>;
        
        const isCanceled = subscription.status === 'canceled';
        const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);

        return (
            <Card>
                <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
                <div className="space-y-3 text-slate-600 dark:text-slate-400">
                    <p><strong>Current Plan:</strong> <span className="font-medium text-slate-800 dark:text-slate-200">{planName}</span></p>
                    <p><strong>Status:</strong> <span className={`font-medium ${isCanceled ? 'text-orange-500' : 'text-green-500'}`}>{subscription.status}</span></p>
                    <p>
                        <strong>
                            {isCanceled ? 'Access ends on:' : 'Renews on:'}
                        </strong> 
                        <span className="font-medium text-slate-800 dark:text-slate-200"> {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                    </p>
                </div>
                <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-wrap gap-4">
                    <Button variant="secondary" onClick={() => navigate('/pricing')}>Change Plan</Button>
                    {isCanceled ? (
                        <Button onClick={handleReactivate}>Reactivate Subscription</Button>
                    ) : (
                        subscription.plan !== 'hobby' && <Button onClick={handleCancel} variant="secondary">Cancel Subscription</Button>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-8 space-y-8">
            <Toast toast={toast} onClose={() => setToast(null)} />
            
            {subscription?.plan === 'hobby' && (
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <p className="text-indigo-800 dark:text-indigo-200 text-center sm:text-left">
                        <span className="font-bold">🚀 Pro plan gives you 200x more generations and priority support.</span>
                    </p>
                    <Button onClick={() => navigate('/pricing')} size="sm" className="flex-shrink-0">Upgrade Now</Button>
                </div>
            )}

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card>
                    <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400">Total Generations</h2>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">{isLoading ? <Spinner size="sm"/> : stats.total}</p>
                </Card>
                <Card>
                    <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400">Short Replies</h2>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">{isLoading ? <Spinner size="sm"/> : stats.shortReplies}</p>
                </Card>
                <Card>
                    <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400">Viral Tweets</h2>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">{isLoading ? <Spinner size="sm"/> : stats.viralTweets}</p>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     <Card>
                        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                        {/* FIX: Use `submissions` state variable instead of undefined `recentSubmissions`. */}
                        {isLoading ? <Spinner /> : submissions.length > 0 ? (
                            <ul className="divide-y divide-y-slate-200 dark:divide-slate-700">
                                {submissions.slice(0, 5).map(item => (
                                    <li key={item.id} className="py-4">
                                        <p className="font-semibold capitalize text-slate-800 dark:text-slate-200">{item.type.replace('-', ' ')}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
                                            {item.type === 'short-reply' ? item.result : 'Generated multiple ideas.'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-slate-500 mt-4">No recent activity.</p>
                        )}
                    </Card>
                </div>
                 <div className="lg:col-span-1">
                    {renderSubscriptionCard()}
                </div>
            </div>

        </div>
    );
};

export default DashboardPage;