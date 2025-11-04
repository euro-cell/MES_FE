import axios from 'axios';
import type { PlanProject, PlanPayload } from './PlanTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** 전체 프로젝트 조회 */
export const getPlanProjects = async (): Promise<PlanProject[]> => {
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  return res.data;
};

/** 생산계획 등록 */
export const savePlan = async (projectId: number, payload: PlanPayload) => {
  const res = await axios.post(`${API_BASE}/production/${projectId}/plan`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/** 생산계획 삭제 */
export const deleteProject = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${id}`, { withCredentials: true });
};

/** 생산계획 조회 */
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

/** 생산계획 수정 */
export const updateProductionPlan = async (projectId: number, payload: any) => {
  try {
    const res = await axios.patch(`${API_BASE}/production/${projectId}/plan`, payload, { withCredentials: true });
    return res.data;
  } catch (err: any) {
    console.error('❌ 생산계획 수정 실패:', err);
    throw err.response?.data || err;
  }
};
