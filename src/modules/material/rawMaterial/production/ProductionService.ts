import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const ProductionService = {
  async getProductions() {
    const res = await axios.get(`${API_BASE}/material/production`, { withCredentials: true });
    return res.data;
  },

  async addProductionMaterial(productionId: number, data: any) {
    const res = await axios.post(`${API_BASE}/production/${productionId}/materials`, data, {
      withCredentials: true,
    });
    return res.data;
  },
};
