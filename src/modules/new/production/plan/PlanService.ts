import axios from 'axios';
import type { PlanProject, PlanPayload } from './PlanTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** 전체 프로젝트 조회 */
export const getPlanProjects = async (): Promise<PlanProject[]> => {
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  console.log('🚀 ~ res:', res.data);
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
