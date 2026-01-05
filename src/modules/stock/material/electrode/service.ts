import axios from 'axios';
import type { ElectrodeMaterial } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getElectrodeMaterials = async (isZeroStock: boolean = false): Promise<ElectrodeMaterial[]> => {
  try {
    const response = await axios.get<ElectrodeMaterial[]>(`${API_BASE}/material/electrode`, {
      params: { isZeroStock },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 전극 자재 조회 실패:', error);
    throw error;
  }
};

export const createElectrodeMaterial = async (material: Omit<ElectrodeMaterial, 'id'>) => {
  try {
    const response = await axios.post<ElectrodeMaterial>(`${API_BASE}/material/electrode`, material, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 전극 자재 생성 실패:', error);
    throw error;
  }
};

export const updateElectrodeMaterial = async (id: number, material: Omit<ElectrodeMaterial, 'id'>) => {
  try {
    const response = await axios.patch<ElectrodeMaterial>(`${API_BASE}/material/electrode/${id}`, material, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 전극 자재 수정 실패:', error);
    throw error;
  }
};

export const deleteElectrodeMaterial = async (id: number) => {
  // 실제 API 호출
  // return await api.delete(`/stock/electrode/${id}`);
  console.log('삭제:', id);
};
