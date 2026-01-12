import axios from 'axios';
import type { LQCProject } from './LQCTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** LQC 프로젝트 목록 조회 */
export const getLQCProjects = async (): Promise<LQCProject[]> => {
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  return res.data;
};

/** 특정 프로젝트 조회 */
export const getLQCProject = async (projectId: number): Promise<LQCProject | null> => {
  const projects = await getLQCProjects();
  return projects.find(p => p.id === projectId) || null;
};
