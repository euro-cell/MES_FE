import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getSpecificationSummary = async () => {
  const res = await axios.get(`${API_BASE}/production/specification`, { withCredentials: true });
  return res.data;
};
