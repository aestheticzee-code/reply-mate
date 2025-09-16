import React, { useState } from 'react';
import ShortReplyGenerator from '../components/ShortReplyGenerator';
import ViralTweetGenerator from '../components/ViralTweetGenerator';
import HistoryPanel from '../components/HistoryPanel';
import Toast from '../components/common/Toast';
import Button from '../components/common/Button';
import { Icons } from '../constants';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);
  const { isAuthenticated } = useAuth();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <HistoryPanel isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      <div className="max-w-7xl mx-auto pt-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
            AI-Powered Social Engagement
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Instantly craft engaging replies and generate viral tweet ideas to boost your online presence.
          </p>
          {isAuthenticated && (
             <div className="mt-6">
                <Button variant="secondary" onClick={() => setIsHistoryOpen(true)}>
                    <span className="mr-2">{Icons.history}</span>
                    View History
                </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <ShortReplyGenerator showToast={showToast} />
          <ViralTweetGenerator showToast={showToast} />
        </div>
      </div>
    </>
  );
};

export default HomePage;