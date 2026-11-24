'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SessionUser } from '@/types';

interface AuthContextType {
  session: SessionUser | null;
  isLoading: boolean;
  isOwner: boolean;
  isVisitor: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  isOwner: false,
  isVisitor: false,
  refreshSession: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.session) {
        setSession(data.session);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const isOwner = session?.role === 'owner';
  const isVisitor = session?.role === 'visitor';

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isOwner,
        isVisitor,
        refreshSession: fetchSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
