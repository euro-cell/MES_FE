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

/** 규격 값 타입 */
export interface SpecValue {
  target?: number;
  tolerance?: number;
  min?: number;
  max?: number;
  unit: string;
}

/** 규격 응답 타입 */
export interface LQCSpec {
  id: number;
  processType: string;
  itemType: string;
  specs: Record<string, SpecValue>;
}

/** LQC 규격 조회 */
export const getLQCSpecs = async (projectId: number, processType?: string, itemType?: string): Promise<LQCSpec[]> => {
  const params = new URLSearchParams();
  if (processType) params.append('processType', processType);
  if (itemType) params.append('itemType', itemType);

  const queryString = params.toString();
  const url = `${API_BASE}/quality/lqc/${projectId}/spec${queryString ? `?${queryString}` : ''}`;

  const res = await axios.get(url, { withCredentials: true });
  return res.data;
};

/** Binder 데이터 응답 타입 */
export interface BinderData {
  id: number;
  manufactureDate: string;
  lot: string;
  viscosity: string;
  solidContent1: string;
  solidContent2: string;
  solidContent3: string;
}

/** Binder 데이터 조회 */
export const getLQCBinderData = async (
  projectId: number,
  electrode: 'A' | 'C'
): Promise<BinderData[]> => {
  const res = await axios.get(`${API_BASE}/quality/lqc/${projectId}/binder?electrode=${electrode}`, {
    withCredentials: true,
  });
  return res.data;
};

/** LQC 규격 저장 */
export const saveLQCSpec = async (
  projectId: number,
  processType: string,
  itemType: string,
  specs: Record<string, SpecValue>
): Promise<LQCSpec> => {
  const res = await axios.post(
    `${API_BASE}/quality/lqc/${projectId}/spec`,
    { processType, itemType, specs },
    { withCredentials: true }
  );
  return res.data;
};
