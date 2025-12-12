import axios from 'axios';
import type { GradingWorklog, GradingWorklogPayload } from './GradingTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /worklog/grading - 엑셀 템플릿 다운로드
 */
export const getGradingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/grading`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/grading - Grading 작업일지 리스트 조회
 */
export const getGradingWorklogs = async (productionId: number): Promise<GradingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/grading`, { withCredentials: true });
  return res.data;
};

/**
 * POST /production/{productionId}/worklog/grading - 작업일지 등록
 */
export const createGradingWorklog = async (
  productionId: number,
  payload: GradingWorklogPayload
): Promise<GradingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/grading`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/{worklogId}/grading - 특정 작업일지 조회
 */
export const getGradingWorklog = async (productionId: number, worklogId: number): Promise<GradingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/grading`, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * PATCH /production/{productionId}/worklog/{worklogId}/grading - 작업일지 수정
 */
export const updateGradingWorklog = async (
  productionId: number,
  worklogId: number,
  payload: Partial<GradingWorklogPayload>
): Promise<GradingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/grading`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * DELETE /production/{productionId}/worklog/{worklogId}/grading - 작업일지 삭제
 */
export const deleteGradingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/grading`, {
    withCredentials: true,
  });
};
