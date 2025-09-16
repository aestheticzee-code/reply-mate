import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';

// Mock users for demonstration purposes
const MOCK_USER: User = { id: 'user123', name: 'Alex', email: 'alex@example.com', isAdmin: false };
const MOCK_ADMIN: User = { id: 'admin456', name: 'Admin Sam', email: 'sam@example.com', isAdmin: true };

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => void;
  logout: () => void;
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for a logged-in user in localStorage to persist session
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
    }
  }, []);

  const login = (email: string, pass: string) => {
    // This is a mock login. In a real app, you'd validate against a backend.
    // We'll log in the admin if the email is 'sam@example.com', otherwise the regular user.
    const currentUser = email.toLowerCase() === 'sam@example.com' ? MOCK_ADMIN : MOCK_USER;
    setUser(currentUser);
    localStorage.setItem('user', JSON.stringify(currentUser));
  };

  const loginWithGoogle = () => {
    // Simulate a successful Google login
    setUser(MOCK_USER);
    localStorage.setItem('user', JSON.stringify(MOCK_USER));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = { user, isAuthenticated: !!user, login, logout, loginWithGoogle };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
