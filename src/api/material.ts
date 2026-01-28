import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Material {
  id: number;
  category: string;
  type: string;
  name: string;
  company: string;
  unit: string;
}

/** 자재 카테고리 목록 조회 */
export async function getMaterialCategories(): Promise<string[]> {
  const response = await axios.get(`${API_BASE}/material/categories`, {
    withCredentials: true,
  });
  return response.data;
}

/** 카테고리별 자재 목록 조회 */
export async function getMaterialsByCategory(category: string): Promise<Material[]> {
  const response = await axios.get(`${API_BASE}/material`, {
    params: { category },
    withCredentials: true,
  });
  return response.data;
}
