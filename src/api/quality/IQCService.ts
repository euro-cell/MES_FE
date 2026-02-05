import axios from 'axios';
import type { IQCProject, IQCSummary, IQCListItem, CathodeMaterial1Data } from '../../modules/quality/iqc/IQCTypes';

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

/** Summary 조회 */
export const getIQCSummary = async (productionId: number): Promise<IQCSummary | null> => {
  try {
    const res = await axios.get(`${API_BASE}/quality/iqc/${productionId}/summary`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error('IQC Summary 조회 실패:', error);
    return null;
  }
};

/** Summary 저장/수정 */
export const saveIQCSummary = async (
  productionId: number,
  data: Partial<IQCSummary>
): Promise<IQCSummary> => {
  const res = await axios.post(`${API_BASE}/quality/iqc/${productionId}/summary`, data, {
    withCredentials: true,
  });
  return res.data;
};

/** IQC List 조회 */
export const getIQCList = async (productionId: number): Promise<IQCListItem[]> => {
  try {
    const res = await axios.get(`${API_BASE}/quality/iqc/${productionId}/list`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error('IQC List 조회 실패:', error);
    return [];
  }
};

/** IQC List 항목 추가 */
export const addIQCListItem = async (
  productionId: number,
  data: Omit<IQCListItem, 'no'>
): Promise<IQCListItem> => {
  const res = await axios.post(`${API_BASE}/quality/iqc/${productionId}/list`, data, {
    withCredentials: true,
  });
  return res.data;
};

/** IQC List 항목 수정 */
export const updateIQCListItem = async (
  itemId: number,
  data: Partial<IQCListItem>
): Promise<IQCListItem> => {
  const res = await axios.put(`${API_BASE}/quality/iqc/list/${itemId}`, data, {
    withCredentials: true,
  });
  return res.data;
};

/** IQC List 항목 삭제 */
export const deleteIQCListItem = async (itemId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/quality/iqc/list/${itemId}`, {
    withCredentials: true,
  });
};

/** 양극재1 조회 */
export const getCathodeMaterial1 = async (productionId: number): Promise<CathodeMaterial1Data | null> => {
  try {
    const res = await axios.get(`${API_BASE}/quality/iqc/${productionId}/cathode-material-1`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error('양극재1 조회 실패:', error);
    return null;
  }
};

/** 양극재1 저장/수정 */
export const saveCathodeMaterial1 = async (
  productionId: number,
  data: Partial<CathodeMaterial1Data>
): Promise<CathodeMaterial1Data> => {
  const res = await axios.post(`${API_BASE}/quality/iqc/${productionId}/cathode-material-1`, data, {
    withCredentials: true,
  });
  return res.data;
};
