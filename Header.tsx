import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppName, Icons } from './constants';
import Button from './components/common/Button';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };
  
  const isAppPage = location.pathname.startsWith('/app') || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={isAuthenticated ? "/app" : "/"} className="flex items-center gap-2">
            {Icons.logo}
            <span className="text-xl font-bold text-slate-800 dark:text-white">{AppName}</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
                <>
                    <Link to="/app" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Generators</Link>
                    <Link to="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Dashboard</Link>
                    {user?.isAdmin && (
                    <Link to="/admin" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Admin</Link>
                    )}
                </>
            ) : (
                <>
                    <a href="/#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Features</a>
                    <a href="/#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Pricing</a>
                </>
            )}
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Welcome, {user?.name}!</span>
                <Button onClick={handleLogout} variant="secondary">Logout</Button>
              </>
            ) : (
               <>
                <Button onClick={() => navigate('/auth')} variant="secondary" size="md" className="hidden sm:inline-flex">Sign In</Button>
                <Button onClick={() => navigate('/auth')}>Get Started</Button>
               </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;