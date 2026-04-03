import axios from '../axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchAllUserPermissions = async () => {
  const res = await axios.get(`${API_BASE}/permission/user/all`, { withCredentials: true });
  return res.data;
};

export const updateUserPermissions = async (data: any[]) => {
  const res = await axios.put(`${API_BASE}/permission/user/all`, data, { withCredentials: true });
  return res.data;
};

export const fetchUserPermissions = async () => {
  const res = await axios.get(`${API_BASE}/permission/user`, { withCredentials: true });
  return res.data;
};

export const updateUserPermission = async (data: any[]) => {
  const res = await axios.put(`${API_BASE}/permission/user`, data, { withCredentials: true });
  return res.data;
};
