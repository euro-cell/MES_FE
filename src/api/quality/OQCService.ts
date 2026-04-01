import axios from '../axiosInstance';
import type { OQCProject } from '../../modules/quality/oqc/OQCTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface GradingCell {
  lotNo: string;
  capacity: number;
  acIr: number;
  ocv3: number;
  ocv4: number | null;
}

export interface SpecValue {
  target?: number;
  tolerance?: number;
  min?: number;
  max?: number;
  unit: string;
}

/** OQC 프로젝트 목록 조회 */
export const getOQCProjects = async (): Promise<OQCProject[]> => {
  const res = await axios.get(`${API_BASE}/project`, { withCredentials: true });
  return res.data;
};

/** 특정 프로젝트 조회 */
export const getOQCProject = async (projectId: number): Promise<OQCProject | null> => {
  const projects = await getOQCProjects();
  return projects.find(p => p.id === projectId) || null;
};

/** Grading 데이터 조회 */
export const getOQCGradingData = async (projectId: number): Promise<GradingCell[]> => {
  const res = await axios.get(
    `${API_BASE}/quality/oqc/${projectId}/grading`,
    { withCredentials: true }
  );
  return res.data;
};

/** 규격 조회 */
export const getOQCSpec = async (
  projectId: number,
  process: string
): Promise<{ specs: Record<string, SpecValue> }[]> => {
  const res = await axios.get(
    `${API_BASE}/quality/oqc/${projectId}/spec?process=${process}`,
    { withCredentials: true }
  );
  return res.data;
};

/** 규격 저장 */
export const saveOQCSpec = async (
  projectId: number,
  processType: string,
  itemType: string,
  specs: Record<string, SpecValue>
) => {
  const res = await axios.post(
    `${API_BASE}/quality/oqc/${projectId}/spec`,
    { processType, itemType, specs },
    { withCredentials: true }
  );
  return res.data;
};
