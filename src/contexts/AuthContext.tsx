import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthStatus } from '../api/auth/authService';
import { setSessionRefreshHandler } from '../api/axiosInstance';

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
  expiresIn: number | null;
  setAuth: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = (expiresAt: string) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const expireTime = new Date(expiresAt).getTime();

    const tick = () => {
      const remaining = Math.floor((expireTime - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        setExpiresIn(0);
        navigate('/login', { replace: true });
        return;
      }
      setExpiresIn(remaining);
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  useEffect(() => {
    setSessionRefreshHandler((expiresAt) => startCountdown(expiresAt));

    getAuthStatus()
      .then(data => {
        setIsAuthenticated(data.authenticated);
        setUser(data.user ?? null);
        if (data.authenticated && data.expiresAt) {
          startCountdown(data.expiresAt);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => setLoading(false));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const setAuth = (user: AuthUser) => {
    setUser(user);
    setIsAuthenticated(true);
    getAuthStatus()
      .then(data => {
        if (data.expiresAt) startCountdown(data.expiresAt);
      })
      .catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, expiresIn, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.');
  return ctx;
}
