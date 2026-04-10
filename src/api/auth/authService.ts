import axios from '../axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    employeeNumber: string;
    name: string;
    department: string;
    role: string;
    isActive: boolean;
  };
}

export async function login(employeeNumber: string, password: string): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>(`${API_BASE}/auth/login`, { employeeNumber, password });
  return res.data;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user?: {
    id: number;
    name: string;
    role: string;
    employeeNumber: string;
    department: string;
  };
}

export async function getAuthStatus(): Promise<AuthStatusResponse> {
  const res = await axios.get<AuthStatusResponse>(`${API_BASE}/auth/status`);
  return res.data;
}
