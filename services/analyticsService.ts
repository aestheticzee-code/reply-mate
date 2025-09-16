
import { getAllSubmissionsAdmin } from './submissionService';
import { Submission } from '../types';

export interface UsageCounts {
    'short-reply': number;
    'viral-tweet': number;
    total: number;
}

export interface AllUsageCounts {
    [userId: string]: UsageCounts;
}

/**
 * Calculates usage counts for all users based on their submission history.
 * In a production app, this would likely be a more optimized query against a database.
 * @returns An object mapping user IDs to their usage counts.
 */
export const getAllUsageCounts = async (): Promise<AllUsageCounts> => {
    const submissions = await getAllSubmissionsAdmin();
    const counts: AllUsageCounts = {};

    submissions.forEach(sub => {
        if (!counts[sub.userId]) {
            counts[sub.userId] = { 'short-reply': 0, 'viral-tweet': 0, total: 0 };
        }
        
        // Ensure the type key exists before incrementing
        if (sub.type === 'short-reply' || sub.type === 'viral-tweet') {
            counts[sub.userId][sub.type]++;
            counts[sub.userId].total++;
        }
    });

    return counts;
};
