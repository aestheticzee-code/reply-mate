import { User } from '../types';

const USERS_KEY = 'social-ai-users';

// Mock users that match those in AuthContext and add a few more for the admin panel
const MOCK_USERS: User[] = [
    { id: 'user123', name: 'Alex', email: 'alex@example.com', isAdmin: false },
    { id: 'admin456', name: 'Admin Sam', email: 'sam@example.com', isAdmin: true },
    { id: 'user789', name: 'Beth', email: 'beth@example.com', isAdmin: false },
    { id: 'user101', name: 'Charlie', email: 'charlie@example.com', isAdmin: false },
];

const initializeUsers = () => {
    // Seed localStorage with mock users if it's empty
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
    }
};

initializeUsers();

/**
 * Gets all users from the mock database.
 * In a real app, this would be an admin-only API call.
 */
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to parse users from localStorage", error);
        return [];
    }
};

/**
 * Gets a single user by their ID from the mock database.
 */
export const getUserById = async (userId: string): Promise<User | null> => {
    const users = await getAllUsers();
    return users.find(u => u.id === userId) || null;
};
