import axios from 'axios';
import type { FillingWorklog, FillingWorklogPayload } from './FillingTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /worklog/filling - 엑셀 템플릿 다운로드
 */
export const getFillingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/filling`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/filling - Filling 작업일지 리스트 조회
 */
export const getFillingWorklogs = async (productionId: number): Promise<FillingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/filling`, { withCredentials: true });
  return res.data;
};

/**
 * POST /production/{productionId}/worklog/filling - 작업일지 등록
 */
export const createFillingWorklog = async (
  productionId: number,
  payload: FillingWorklogPayload
): Promise<FillingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/filling`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/{worklogId}/filling - 특정 작업일지 조회
 */
export const getFillingWorklog = async (productionId: number, worklogId: number): Promise<FillingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/filling`, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * PATCH /production/{productionId}/worklog/{worklogId}/filling - 작업일지 수정
 */
export const updateFillingWorklog = async (
  productionId: number,
  worklogId: number,
  payload: Partial<FillingWorklogPayload>
): Promise<FillingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/filling`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * DELETE /production/{productionId}/worklog/{worklogId}/filling - 작업일지 삭제
 */
export const deleteFillingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/filling`, {
    withCredentials: true,
  });
};
