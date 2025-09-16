
import { Submission } from '../types';

const SUBMISSIONS_KEY = 'social-ai-submissions';

// Helper to get all submissions from localStorage
const getAllSubmissions = (): Submission[] => {
    try {
        const data = localStorage.getItem(SUBMISSIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to parse submissions from localStorage", error);
        return [];
    }
};

// Helper to save all submissions to localStorage
const saveAllSubmissions = (submissions: Submission[]) => {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
};

// Get all submissions for a specific user, sorted by date
export const getSubmissionsForUser = async (userId: string): Promise<Submission[]> => {
    const allSubmissions = getAllSubmissions();
    const userSubmissions = allSubmissions.filter(s => s.userId === userId);
    return userSubmissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Get ALL submissions for the admin panel
export const getAllSubmissionsAdmin = async (): Promise<Submission[]> => {
    const allSubmissions = getAllSubmissions();
    return allSubmissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


// Save a new submission
export const saveSubmission = async (submissionData: Omit<Submission, 'id' | 'createdAt'>): Promise<Submission> => {
    const allSubmissions = getAllSubmissions();
    const newSubmission: Submission = {
        ...submissionData,
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
    };
    allSubmissions.push(newSubmission);
    saveAllSubmissions(allSubmissions);
    return newSubmission;
};

// Delete a submission
export const deleteSubmission = async (submissionId: string): Promise<void> => {
    let allSubmissions = getAllSubmissions();
    allSubmissions = allSubmissions.filter(s => s.id !== submissionId);
    saveAllSubmissions(allSubmissions);
};