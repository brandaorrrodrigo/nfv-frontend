'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api/client';
import type { NFVUser, NFVProfession } from '@/lib/api/types';

interface AuthContextType {
  user: NFVUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    profession: NFVProfession;
    registerNumber?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<NFVUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api
        .getProfile()
        .then((profile) => {
          setUser(profile);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // If profile fails, try to decode JWT for basic user data
          const decoded = api.decodeToken(token);
          if (decoded && decoded.id) {
            setUser({
              id: decoded.id as string,
              email: decoded.email as string,
              name: (decoded.name as string) || 'Profissional',
              plan: (decoded.plan as NFVUser['plan']) || 'FREE',
              createdAt: new Date().toISOString(),
            });
            setIsAuthenticated(true);
          } else {
            api.clearTokens();
            setIsAuthenticated(false);
            setUser(null);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login({ email, password });
    setUser({
      id: response.professional.id,
      email: response.professional.email,
      name: response.professional.name,
      profession: response.professional.profession,
      plan: response.professional.plan,
      createdAt: new Date().toISOString(),
    });
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    profession: NFVProfession;
    registerNumber?: string;
  }) => {
    const response = await api.register(data);
    setUser({
      id: response.professional.id,
      email: response.professional.email,
      name: response.professional.name,
      profession: response.professional.profession,
      plan: response.professional.plan,
      createdAt: new Date().toISOString(),
    });
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await api.getProfile();
    setUser(profile);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
