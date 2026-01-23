import axios from 'axios';
import type { CoatingWorklog, CoatingWorklogPayload } from './CoatingTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** Coating 템플릿 다운로드 */
export const getCoatingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/coating`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

/** Coating 작업일지 목록 조회 */
export const getCoatingWorklogs = async (productionId: number): Promise<CoatingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/coating`, {
    withCredentials: true,
  });
  return res.data;
};

/** Coating 작업일지 등록 */
export const createCoatingWorklog = async (
  productionId: number,
  payload: CoatingWorklogPayload
): Promise<CoatingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/coating`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/** Coating 작업일지 단건 조회 */
export const getCoatingWorklog = async (productionId: number, worklogId: number): Promise<CoatingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/coating`, {
    withCredentials: true,
  });
  return res.data;
};

/** Coating 작업일지 수정 */
export const updateCoatingWorklog = async (
  productionId: number,
  worklogId: number,
  payload: Partial<CoatingWorklogPayload>
): Promise<CoatingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/coating`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/** Coating 작업일지 삭제 */
export const deleteCoatingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/coating`, {
    withCredentials: true,
  });
};
