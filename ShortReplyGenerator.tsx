import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { saveSubmission } from './services/submissionService';
import { checkInputSafety } from './services/contentSafetyService';
import Card from './components/common/Card';
import Button from './components/common/Button';
import { Icons } from './constants';

interface ShortReplyGeneratorProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const TONES = ['Friendly', 'Professional', 'Witty', 'Casual', 'Supportive'];

const ShortReplyGenerator: React.FC<ShortReplyGeneratorProps> = ({ showToast }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postContent, setPostContent] = useState('');
  const [tone, setTone] = useState('Friendly');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const handleGenerate = async () => {
    if (!postContent.trim()) {
      showToast('Please enter the post content.', 'error');
      return;
    }
    if (!checkInputSafety(postContent)) {
      showToast('Input contains potentially unsafe content. Please revise.', 'error');
      return;
    }

    setIsLoading(true);
    setResult('');
    setQuotaExceeded(false);

    try {
      const response = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postContent, tone }),
      });

      if (response.status === 402) {
        setQuotaExceeded(true);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      const data = await response.json();
      const reply = data.reply;
      setResult(reply);

      if (user) {
        await saveSubmission({
          userId: user.id,
          type: 'short-reply',
          input: { postContent, tone },
          result: reply,
        });
      }
      showToast('Reply generated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast(errorMessage, 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    showToast('Copied to clipboard!');
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-indigo-500">{Icons.reply}</span>
        <h2 className="text-2xl font-bold">Short Reply Generator</h2>
      </div>
      <p className="text-slate-500 dark:text-slate-400">
        Instantly generate a context-aware reply for any social media post.
      </p>
      
      <div>
        <label htmlFor="post-content" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Original Post Content
        </label>
        <textarea
          id="post-content"
          rows={4}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="e.g., Just launched my new project on Product Hunt! Check it out!"
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
        />
      </div>

      <div>
        <label htmlFor="tone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Select Tone
        </label>
        <select
          id="tone"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600"
        >
          {TONES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <Button onClick={handleGenerate} isLoading={isLoading} className="w-full" disabled={quotaExceeded}>
        Generate Reply
      </Button>

      {quotaExceeded && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center dark:bg-indigo-900/20 dark:border-indigo-800 animate-fade-in">
          <h3 className="font-semibold text-indigo-800 dark:text-indigo-200">You've reached your monthly limit.</h3>
          <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">Upgrade to Pro for just $19/month and unlock 2,000 generations.</p>
          <Button onClick={() => navigate('/pricing')} className="mt-4" size="sm">Upgrade Plan</Button>
        </div>
      )}

      {result && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold">Generated Reply:</h3>
          <div className="mt-2 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-md">
            <p className="text-slate-800 dark:text-slate-200">{result}</p>
          </div>
          <Button onClick={handleCopy} variant="secondary" size="sm" className="mt-2">
            Copy
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ShortReplyGenerator;