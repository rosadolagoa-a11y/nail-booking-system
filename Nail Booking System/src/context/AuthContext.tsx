import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserRole } from '../types/database.types';
import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nail_booking_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          const parsedUser: AuthUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    void supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
