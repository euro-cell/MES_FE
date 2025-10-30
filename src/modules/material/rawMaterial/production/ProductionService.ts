import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const ProductionService = {
  async getProductions() {
    const res = await axios.get(`${API_BASE}/material/production`, { withCredentials: true });
    return res.data;
  },
};
