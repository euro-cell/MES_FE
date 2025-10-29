import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchAllMaterials = async () => {
  const res = await axios.get(`${API_BASE}/material`, { withCredentials: true });
  return res.data;
};
