// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import axios from 'axios';

interface AuthStatusResponse {
  authenticated: boolean;
  user?: {
    id: number;
    name: string;
    role: string;
    employeeNumber: string;
  };
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthStatusResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<AuthStatusResponse>('http://192.168.0.22:8080/auth/status', { withCredentials: true })
      .then(res => {
        setIsAuthenticated(res.data.authenticated);
        setUser(res.data.user ?? null);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { isAuthenticated, user, loading };
}
