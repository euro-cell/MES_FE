import axios from 'axios';
import type { SlurryWorklog, SlurryWorklogPayload } from './SlurryTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /worklog/slurry - 엑셀 템플릿 다운로드
 */
export const getSlurryTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/slurry`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/slurry - Slurry 작업일지 리스트 조회
 */
export const getSlurryWorklogs = async (productionId: number): Promise<SlurryWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/slurry`, { withCredentials: true });
  return res.data;
};

/**
 * POST /production/{productionId}/worklog/slurry - 작업일지 등록
 */
export const createSlurryWorklog = async (
  productionId: number,
  payload: SlurryWorklogPayload
): Promise<SlurryWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/slurry`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/{worklogId}/slurry - 특정 작업일지 조회
 */
export const getSlurryWorklog = async (productionId: number, worklogId: number): Promise<SlurryWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/slurry`, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * PATCH /production/{productionId}/worklog/{worklogId}/slurry - 작업일지 수정
 */
export const updateSlurryWorklog = async (
  productionId: number,
  worklogId: number,
  payload: Partial<SlurryWorklogPayload>
): Promise<SlurryWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/slurry`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * DELETE /production/{productionId}/worklog/{worklogId}/slurry - 작업일지 삭제
 */
export const deleteSlurryWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/slurry`, {
    withCredentials: true,
  });
};
