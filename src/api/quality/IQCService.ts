import axios from 'axios';
import type { IQCProject, IQCItem, IQCItemRequest } from '../../modules/quality/iqc/IQCTypes';

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

/** IQC 목록 조회 */
export const getIQCList = async (productionId: number): Promise<IQCItem[]> => {
  try {
    const res = await axios.get(`${API_BASE}/quality/iqc/${productionId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error('IQC 목록 조회 실패:', error);
    return [];
  }
};

/** IQC 단건 조회 */
export const getIQCDetail = async (id: number): Promise<IQCItem | null> => {
  try {
    const res = await axios.get(`${API_BASE}/quality/iqc/detail/${id}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error('IQC 단건 조회 실패:', error);
    return null;
  }
};

/** IQC 생성 */
export const createIQC = async (
  productionId: number,
  data: IQCItemRequest
): Promise<IQCItem> => {
  const res = await axios.post(`${API_BASE}/quality/iqc/${productionId}`, data, {
    withCredentials: true,
  });
  return res.data;
};

/** IQC 수정 */
export const updateIQC = async (
  id: number,
  data: Partial<IQCItemRequest>
): Promise<IQCItem> => {
  const res = await axios.put(`${API_BASE}/quality/iqc/detail/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

/** IQC 삭제 */
export const deleteIQC = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/quality/iqc/detail/${id}`, {
    withCredentials: true,
  });
};
