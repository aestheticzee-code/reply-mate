import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { AppName, Icons } from '../constants';

const FeatureCard: React.FC<{ icon: JSX.Element; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
    <div className="text-indigo-500 mb-4">{React.cloneElement(icon, { className: "h-12 w-12" })}</div>
    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400">{children}</p>
  </div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="text-center pt-16 md:pt-24">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Supercharge Your Social Media with <span className="text-indigo-600 dark:text-indigo-400">{AppName}</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Stop guessing. Start engaging. Our AI-powered tools help you craft viral content and meaningful replies in seconds.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => navigate('/auth')} size="md">Get Started for Free</Button>
          <a href="#features">
            <Button variant="secondary" size="md">Learn More</Button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Why You'll Love {AppName}</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Everything you need to grow your online presence.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard icon={Icons.reply} title="Instant Replies">
            Generate context-aware replies for any social media post. Choose your tone and let our AI handle the rest.
          </FeatureCard>
          <FeatureCard icon={Icons.viral} title="Viral Tweet Ideas">
            Turn your best content into viral hits. Our AI analyzes successful tweets to generate unique, engaging ideas for you.
          </FeatureCard>
          <FeatureCard icon={Icons.history} title="Content History">
             Easily track, review, and reuse all your generated content. Never lose a great idea again.
          </FeatureCard>
        </div>
      </section>
      
      {/* Pricing Section Teaser */}
      <section id="pricing" className="scroll-mt-20 text-center bg-slate-50 dark:bg-slate-800/50 py-16 rounded-lg">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Choose a plan that scales with you. Get started for free, no credit card required.
          </p>
          <div className="mt-8">
            <Button onClick={() => navigate('/pricing')}>View Pricing Plans</Button>
          </div>
      </section>

    </div>
  );
};

export default LandingPage;
