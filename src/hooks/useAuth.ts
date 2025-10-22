const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
      .get<AuthStatusResponse>(`${API_BASE}/auth/status`, { withCredentials: true })
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
