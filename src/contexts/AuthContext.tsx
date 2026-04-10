import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getAuthStatus } from '../api/auth/authService';

interface AuthUser {
  id: number;
  name: string;
  role: string;
  employeeNumber: string;
  department: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  setAuth: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuthStatus()
      .then(data => {
        setIsAuthenticated(data.authenticated);
        setUser(data.user ?? null);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setAuth = (user: AuthUser) => {
    setUser(user);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.');
  return ctx;
}
