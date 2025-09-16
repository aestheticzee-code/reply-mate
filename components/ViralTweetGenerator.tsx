import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveSubmission } from '../services/submissionService';
import { checkInputSafety } from '../services/contentSafetyService';
import Card from './common/Card';
import Button from './common/Button';
import { Icons } from '../constants';

interface ViralTweetGeneratorProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ViralTweetGenerator: React.FC<ViralTweetGeneratorProps> = ({ showToast }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [examples, setExamples] = useState<string[]>(['', '', '']);
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const handleGenerate = async () => {
    const filledExamples = examples.filter(e => e.trim() !== '');
    if (filledExamples.length < 2) {
      showToast('Please provide at least 2 example tweets.', 'error');
      return;
    }
    if (filledExamples.some(ex => !checkInputSafety(ex))) {
        showToast('One or more examples contain potentially unsafe content.', 'error');
        return;
    }

    setIsLoading(true);
    setResults([]);
    setQuotaExceeded(false);

    try {
        const response = await fetch('/api/generate-tweets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ examples: filledExamples }),
        });

        if (response.status === 402) {
            setQuotaExceeded(true);
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate tweets');
        }

        const data = await response.json();
        const tweets = data.tweets;
        setResults(tweets);

        if (user) {
            await saveSubmission({
                userId: user.id,
                type: 'viral-tweet',
                input: { examples: filledExamples },
                result: JSON.stringify(tweets),
            });
        }
        showToast('Tweet ideas generated!');

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        showToast(errorMessage, 'error');
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Tweet copied!');
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-indigo-500">{Icons.viral}</span>
        <h2 className="text-2xl font-bold">Viral Tweet Generator</h2>
      </div>
       <p className="text-slate-500 dark:text-slate-400">
        Get unique, viral-ready tweet ideas based on content you already love.
      </p>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Example Tweets (provide at least 2)
        </label>
        <div className="space-y-2 mt-1">
          {examples.map((ex, i) => (
            <input
              key={i}
              type="text"
              value={ex}
              onChange={(e) => handleExampleChange(i, e.target.value)}
              placeholder={`Example tweet ${i + 1}...`}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
            />
          ))}
        </div>
      </div>
      
      <Button onClick={handleGenerate} isLoading={isLoading} className="w-full" disabled={quotaExceeded}>
        Generate Tweet Ideas
      </Button>
      
      {quotaExceeded && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center dark:bg-indigo-900/20 dark:border-indigo-800 animate-fade-in">
          <h3 className="font-semibold text-indigo-800 dark:text-indigo-200">You've reached your monthly limit.</h3>
          <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">Upgrade to Pro for just $19/month and unlock 2,000 generations.</p>
          <Button onClick={() => navigate('/pricing')} className="mt-4" size="sm">Upgrade Plan</Button>
        </div>
      )}

      {results.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold">Generated Ideas:</h3>
          <ul className="mt-2 space-y-3">
            {results.map((tweet, i) => (
              <li key={i} className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-md">
                <p className="text-slate-800 dark:text-slate-200">{tweet}</p>
                 <Button onClick={() => handleCopy(tweet)} variant="secondary" size="sm" className="mt-2">
                    Copy
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default ViralTweetGenerator;