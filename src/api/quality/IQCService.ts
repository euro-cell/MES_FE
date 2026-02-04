import axios from 'axios';
import type { IQCProject } from '../../modules/quality/iqc/IQCTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** IQC 프로젝트 목록 조회 */
export const getIQCProjects = async (): Promise<IQCProject[]> => {
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  return res.data;
};

/** 특정 프로젝트 조회 */
export const getIQCProject = async (projectId: number): Promise<IQCProject | null> => {
  const projects = await getIQCProjects();
  return projects.find(p => p.id === projectId) || null;
};
