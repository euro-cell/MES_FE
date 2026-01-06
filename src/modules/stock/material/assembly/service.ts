import axios from 'axios';
import type { AssemblyMaterial } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getAssemblyMaterials = async (isZeroStock: boolean = false): Promise<AssemblyMaterial[]> => {
  try {
    const response = await axios.get<AssemblyMaterial[]>(`${API_BASE}/material/assembly`, {
      params: { isZeroStock },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 조립 자재 조회 실패:', error);
    throw error;
  }
};

export const createAssemblyMaterial = async (material: Omit<AssemblyMaterial, 'id'>) => {
  try {
    const response = await axios.post<AssemblyMaterial>(`${API_BASE}/material/assembly`, material, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 조립 자재 생성 실패:', error);
    throw error;
  }
};

export const updateAssemblyMaterial = async (id: number, material: Omit<AssemblyMaterial, 'id'>) => {
  try {
    const response = await axios.patch<AssemblyMaterial>(`${API_BASE}/material/assembly/${id}`, material, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 조립 자재 수정 실패:', error);
    throw error;
  }
};

export const deleteAssemblyMaterial = async (id: number, isHardDelete: boolean = false) => {
  try {
    const response = await axios.delete<AssemblyMaterial>(`${API_BASE}/material/assembly/${id}`, {
      params: { hardDelete: isHardDelete },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 조립 자재 삭제 실패:', error);
    throw error;
  }
};

export const getAssemblyHistory = async (page: number = 1, limit: number = 20) => {
  try {
    const response = await axios.get(`${API_BASE}/material/history/assembly`, {
      params: { page, limit },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 조립 입/출고 이력 조회 실패:', error);
    throw error;
  }
};
