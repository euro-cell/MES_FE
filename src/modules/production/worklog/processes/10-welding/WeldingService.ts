import axios from 'axios';
import type { WeldingWorklog, WeldingWorklogPayload } from './WeldingTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /worklog/welding - 엑셀 템플릿 다운로드
 */
export const getWeldingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/welding`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/welding - Welding 작업일지 리스트 조회
 */
export const getWeldingWorklogs = async (productionId: number): Promise<WeldingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/welding`, { withCredentials: true });
  return res.data;
};

/**
 * POST /production/{productionId}/worklog/welding - 작업일지 등록
 */
export const createWeldingWorklog = async (
  productionId: number,
  payload: WeldingWorklogPayload
): Promise<WeldingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/welding`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/{worklogId}/welding - 특정 작업일지 조회
 */
export const getWeldingWorklog = async (productionId: number, worklogId: number): Promise<WeldingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/welding`, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * PATCH /production/{productionId}/worklog/{worklogId}/welding - 작업일지 수정
 */
export const updateWeldingWorklog = async (
  productionId: number,
  worklogId: number,
  payload: Partial<WeldingWorklogPayload>
): Promise<WeldingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/welding`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * DELETE /production/{productionId}/worklog/{worklogId}/welding - 작업일지 삭제
 */
export const deleteWeldingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/welding`, {
    withCredentials: true,
  });
};
