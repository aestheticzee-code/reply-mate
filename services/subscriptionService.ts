import { Subscription, PlanId } from '../types';

const SUBSCRIPTIONS_KEY = 'social-ai-subscriptions';

interface SubscriptionsData {
    [userId: string]: Subscription;
}

// Helper to get all subscriptions from localStorage
const getAllSubscriptions = (): SubscriptionsData => {
    try {
        const data = localStorage.getItem(SUBSCRIPTIONS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error("Failed to parse subscriptions from localStorage", error);
        return {};
    }
};

// Helper to save all subscriptions to localStorage
const saveAllSubscriptions = (subscriptions: SubscriptionsData) => {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
};

// Get subscription for a specific user
export const getUserSubscription = async (userId: string): Promise<Subscription> => {
    const subscriptions = getAllSubscriptions();
    if (!subscriptions[userId]) {
        // Default to hobby plan if no subscription exists for the user
        const defaultSub: Subscription = {
            plan: 'hobby',
            status: 'active',
            // Set a long expiry date for the free hobby plan
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        };
        subscriptions[userId] = defaultSub;
        saveAllSubscriptions(subscriptions);
        return defaultSub;
    }
    return subscriptions[userId];
};

// Update a user's subscription details. Used by the Stripe webhook mock.
export const updateUserSubscription = async (userId: string, newSubDetails: Subscription): Promise<Subscription> => {
    const subscriptions = getAllSubscriptions();
    subscriptions[userId] = newSubDetails;
    saveAllSubscriptions(subscriptions);
    return subscriptions[userId];
};

// Cancel a subscription by updating its status
export const cancelSubscription = async (userId: string): Promise<Subscription> => {
    const subscriptions = getAllSubscriptions();
    const userSub = subscriptions[userId];
    if (userSub) {
        userSub.status = 'canceled';
        saveAllSubscriptions(subscriptions);
        return userSub;
    }
    throw new Error('Subscription not found for user.');
};

// Reactivate a subscription by updating its status
export const reactivateSubscription = async (userId: string): Promise<Subscription> => {
    const subscriptions = getAllSubscriptions();
    const userSub = subscriptions[userId];
    if (userSub) {
        userSub.status = 'active';
        saveAllSubscriptions(subscriptions);
        return userSub;
    }
    throw new Error('Subscription not found for user.');
};
