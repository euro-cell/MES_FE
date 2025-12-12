import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ✅ 모든 사용자별 권한 조회
export const fetchAllUserPermissions = async () => {
  const res = await axios.get(`${API_BASE}/permission/user/all`, { withCredentials: true });
  return res.data;
};

// ✅ 사용자별 권한 저장
export const updateUserPermissions = async (data: any[]) => {
  const res = await axios.put(`${API_BASE}/permission/user/all`, data, { withCredentials: true });
  return res.data;
};
