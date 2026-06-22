import axios from './axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Material {
  id: number;
  category: string;
  type: string;
  name: string;
  company: string;
  unit: string;
}

export interface MaterialLot {
  id: number;
  lot: string;
  name: string;
  receivedDate: string;
  remainingQty: number;
  manufacturer?: string;
  spec?: string;
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

/** 자재 LOT 목록 조회 (선입선출 정렬) */
export async function getMaterialLots(params?: {
  category?: string;
  type?: string;
  isZeroStock?: boolean;
}): Promise<MaterialLot[]> {
  const response = await axios.get(`${API_BASE}/material/lots`, {
    params,
    withCredentials: true,
  });
  return response.data;
}
