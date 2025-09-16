import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';

// A wrapper for routes that require authentication
const PrivateRoute: React.FC<{ children: JSX.Element; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    if (adminOnly && !user?.isAdmin) {
        return <Navigate to="/app" replace />;
    }
    return children;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/auth" element={isAuthenticated ? <Navigate to="/app" /> : <AuthPage />} />
                
                <Route
                    path="/app"
                    element={
                        <PrivateRoute>
                            <HomePage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute adminOnly={true}>
                            <AdminPage />
                        </PrivateRoute>
                    }
                />

                {/* Redirect any unknown routes to the main app page if logged in, or landing page if not */}
                <Route path="*" element={<Navigate to={isAuthenticated ? "/app" : "/"} replace />} />
            </Routes>
        </Layout>
    );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
