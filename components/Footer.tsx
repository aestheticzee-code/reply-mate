import React from 'react';
import { AppName } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900/50 mt-12">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} {AppName}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
