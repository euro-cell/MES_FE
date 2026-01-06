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

export const deleteElectrodeMaterial = async (id: number, isHardDelete: boolean = false) => {
  try {
    const response = await axios.delete<ElectrodeMaterial>(`${API_BASE}/material/electrode/${id}`, {
      params: { hardDelete: isHardDelete },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 전극 자재 삭제 실패:', error);
    throw error;
  }
};

export const getElectrodeHistory = async (page: number = 1, limit: number = 20) => {
  try {
    const response = await axios.get(`${API_BASE}/material/history/electrode`, {
      params: { page, limit },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 전극 입/출고 이력 조회 실패:', error);
    throw error;
  }
};
