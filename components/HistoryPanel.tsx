import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSubmissionsForUser, deleteSubmission } from '../services/submissionService';
import { Submission } from '../types';
import { Icons } from '../constants';
import Spinner from './common/Spinner';
import Button from './common/Button';

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setIsLoading(true);
            getSubmissionsForUser(user.id)
                .then(data => {
                    setHistory(data);
                })
                .catch(err => console.error("Failed to fetch history:", err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, user]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await deleteSubmission(id);
            setHistory(history.filter(item => item.id !== id));
        }
    };

    const renderResult = (item: Submission) => {
        if (item.type === 'viral-tweet') {
            try {
                // Handle new format: string[]
                const tweets: string[] | any[] = JSON.parse(item.result);
                if (Array.isArray(tweets) && (typeof tweets[0] === 'string' || tweets.length === 0)) {
                     return (
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            {tweets.map((tweet, index) => <li key={index}>{tweet}</li>)}
                        </ul>
                    );
                }
                // Handle old format: SocialPost[]
                if (Array.isArray(tweets) && typeof tweets[0] === 'object' && tweets[0] !== null && 'hook' in tweets[0]) {
                    return (
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            {tweets.map((tweet, index) => <li key={index}><strong>{tweet.hook}</strong> {tweet.body}</li>)}
                        </ul>
                    );
                }
                
                return <p className="whitespace-pre-wrap">{item.result}</p>;

            } catch (e) {
                return <p className="whitespace-pre-wrap">{item.result}</p>;
            }
        }
        return <p className="whitespace-pre-wrap">{item.result}</p>;
    };

    return (
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-[60] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold">History</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    {Icons.close}
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner />
                    </div>
                ) : history.length === 0 ? (
                    <p className="text-center text-slate-500 mt-8">No history found.</p>
                ) : (
                    <ul className="space-y-4">
                        {history.map(item => (
                            <li key={item.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                                        <p className="font-semibold capitalize mt-1 text-slate-800 dark:text-slate-200">{item.type.replace('-', ' ')}</p>
                                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                            {renderResult(item)}
                                        </div>
                                    </div>
                                    <Button onClick={() => handleDelete(item.id)} variant="secondary" size="sm" className="ml-2 flex-shrink-0">Delete</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default HistoryPanel;