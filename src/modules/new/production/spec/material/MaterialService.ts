import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function getMaterialCategories(): Promise<string[]> {
  const res = await axios.get(`${API_BASE}/material/categories`);
  return res.data;
}

export async function getMaterialsByCategory(category: string) {
  const res = await axios.get(`${API_BASE}/material?category=${encodeURIComponent(category)}`);
  return res.data;
}

export async function postMaterialRequirements(productionId: number, payload: any) {
  const res = await axios.post(`${API_BASE}/production/${productionId}/materials`, payload);
  return res.data;
}
