import axios from 'axios';
import type { Project } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getAllProductions = async (): Promise<Project[]> => {
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  return res.data;
};

export const saveProductionPlan = async (
  projectId: number,
  payload: {
    startDate: string;
    endDate: string;
    weekInfo: string;
    processPlans: Record<string, { start: string; end: string }>;
  }
) => {
  try {
    const res = await axios.post(`${API_BASE}/production/${projectId}/plan`, payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    console.error('❌ 생산계획 저장 실패:', err);
    throw err.response?.data || err;
  }
};

export const getProductionPlan = async (projectId: number) => {
  try {
    const res = await axios.get(`${API_BASE}/production/${projectId}/plan`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    console.error('❌ 생산계획 조회 실패:', err);
    throw err.response?.data || err;
  }
};

export const deleteProduction = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/production/${id}`, { withCredentials: true });
  } catch (err: any) {
    console.error('❌ 프로젝트 삭제 실패:', err);
    throw err.response?.data || err;
  }
};
