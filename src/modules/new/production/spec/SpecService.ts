import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getSpecificationSummary = async () => {
  const res = await axios.get(`${API_BASE}/production/specification`, { withCredentials: true });
  return res.data;
};

export async function createSpecification(productionId: number, specData: any) {
  const res = await axios.post(`${API_BASE}/production/${productionId}/specification`, specData, {
    withCredentials: true,
  });
  return res.data;
}

export async function getSpecificationByProject(productionId: number) {
  const res = await axios.get(`${API_BASE}/production/${productionId}/specification`);
  return res.data;
}
