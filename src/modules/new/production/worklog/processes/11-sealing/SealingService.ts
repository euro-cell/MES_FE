import axios from 'axios';
import type { SealingWorklog, SealingWorklogPayload } from './SealingTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /worklog/sealing - 엑셀 템플릿 다운로드
 */
export const getSealingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/sealing`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/sealing - Sealing 작업일지 리스트 조회
 */
export const getSealingWorklogs = async (productionId: number): Promise<SealingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/sealing`, { withCredentials: true });
  return res.data;
};

/**
 * POST /production/{productionId}/worklog/sealing - 작업일지 등록
 */
export const createSealingWorklog = async (
  productionId: number,
  payload: SealingWorklogPayload
): Promise<SealingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/sealing`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/{worklogId}/sealing - 특정 작업일지 조회
 */
export const getSealingWorklog = async (productionId: number, worklogId: number): Promise<SealingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/sealing`, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * PATCH /production/{productionId}/worklog/{worklogId}/sealing - 작업일지 수정
 */
export const updateSealingWorklog = async (
  productionId: number,
  worklogId: number,
  payload: Partial<SealingWorklogPayload>
): Promise<SealingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/sealing`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * DELETE /production/{productionId}/worklog/{worklogId}/sealing - 작업일지 삭제
 */
export const deleteSealingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/sealing`, {
    withCredentials: true,
  });
};
