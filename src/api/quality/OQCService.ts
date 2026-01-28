import axios from 'axios';
import type { OQCProject } from '../../modules/quality/oqc/OQCTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** OQC 프로젝트 목록 조회 */
export const getOQCProjects = async (): Promise<OQCProject[]> => {
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  return res.data;
};

/** 특정 프로젝트 조회 */
export const getOQCProject = async (projectId: number): Promise<OQCProject | null> => {
  const projects = await getOQCProjects();
  return projects.find(p => p.id === projectId) || null;
};
