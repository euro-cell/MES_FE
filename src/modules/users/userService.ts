// 📄 src/modules/users/userService.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface User {
  id: number;
  name: string;
  employeeNumber: string;
  department: string;
  position: string;
  isActive?: boolean;
  createdAt: string;
}

const fromBackend = (user: any): User => ({
  id: user.id,
  name: user.name,
  employeeNumber: user.employeeNumber,
  department: user.department,
  position: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// ✅ position → role로 매핑 (등록/수정 시 백엔드로 보낼 때)
const toBackend = (user: Partial<User>) => ({
  ...user,
  role: user.position,
});

export const getUsers = async (): Promise<User[]> => {
  const res = await axios.get(`${API_BASE}/user`, { withCredentials: true });
  return res.data.map(fromBackend);
};

export const createUser = async (data: Omit<User, 'id' | 'createdAt'>) => {
  const payload = toBackend(data);
  delete payload.position;
  const res = await axios.post(`${API_BASE}/auth/register`, payload, { withCredentials: true });
  return fromBackend(res.data);
};

export const updateUser = async (id: number, data: Partial<User>) => {
  const payload = toBackend(data);
  delete payload.position;
  const res = await axios.patch(`${API_BASE}/user/${id}`, payload, { withCredentials: true });
  return fromBackend(res.data);
};

export const deleteUser = async (id: number) => {
  const res = await axios.delete(`${API_BASE}/user/${id}`, { withCredentials: true });
  return res.data;
};

export const toggleUserActive = async (id: number, isActive: boolean) => {
  const res = await axios.patch(`${API_BASE}/user/${id}`, { isActive }, { withCredentials: true });
  return res.data;
};
