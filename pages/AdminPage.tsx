import React, { useEffect, useState } from 'react';
import { getAllSubmissionsAdmin } from '../services/submissionService';
import { getAllUsageCounts, AllUsageCounts } from '../services/analyticsService';
import { getAllUsers } from '../services/userService';
import { Submission, User } from '../types';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';

const AdminPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [usage, setUsage] = useState<AllUsageCounts>({});
    const [isLoading, setIsLoading] = useState(true);
    const [userMap, setUserMap] = useState<Map<string, User>>(new Map());

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [submissionsData, usageData, usersData] = await Promise.all([
                    getAllSubmissionsAdmin(),
                    getAllUsageCounts(),
                    getAllUsers()
                ]);
                
                setSubmissions(submissionsData);
                setUsage(usageData);
                setUsers(usersData);

                const map = new Map<string, User>();
                usersData.forEach(user => map.set(user.id, user));
                setUserMap(map);

            } catch (error) {
                console.error("Failed to load admin data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const getUserEmail = (userId: string) => userMap.get(userId)?.email || 'Unknown User';

    if (isLoading) {
        return <div className="flex justify-center items-center h-full py-10"><Spinner size="lg" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>

            <Card>
                <h2 className="text-xl font-semibold mb-4">User Analytics</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Short Replies</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Viral Tweets</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Generations</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {users.map(user => {
                                const userUsage = usage[user.id] || { 'short-reply': 0, 'viral-tweet': 0, total: 0 };
                                return (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{user.name} ({user.email})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{userUsage['short-reply']}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{userUsage['viral-tweet']}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{userUsage.total}</td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-4">All Submissions</h2>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {submissions.length > 0 ? submissions.slice(0, 20).map(item => ( // Show latest 20
                        <li key={item.id} className="py-4">
                            <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()} - <span className="font-semibold">{getUserEmail(item.userId)}</span></p>
                            <p className="font-semibold capitalize mt-1 text-slate-800 dark:text-slate-200">{item.type.replace('-', ' ')}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
                                {item.result.length > 100 ? `${item.result.substring(0, 100)}...` : item.result}
                            </p>
                        </li>
                    )) : <p className="text-center text-slate-500 mt-4">No submissions yet.</p>}
                </ul>
            </Card>
        </div>
    );
};

export default AdminPage;
