import axios from 'axios';
import type { FormationWorklog, FormationWorklogPayload } from './FormationTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /worklog/formation - 엑셀 템플릿 다운로드
 */
export const getFormationTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/formation`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/formation - Formation 작업일지 리스트 조회
 */
export const getFormationWorklogs = async (productionId: number): Promise<FormationWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/formation`, { withCredentials: true });
  return res.data;
};

/**
 * POST /production/{productionId}/worklog/formation - 작업일지 등록
 */
export const createFormationWorklog = async (
  productionId: number,
  payload: FormationWorklogPayload
): Promise<FormationWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/formation`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/{worklogId}/formation - 특정 작업일지 조회
 */
export const getFormationWorklog = async (productionId: number, worklogId: number): Promise<FormationWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/formation`, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * PATCH /production/{productionId}/worklog/{worklogId}/formation - 작업일지 수정
 */
export const updateFormationWorklog = async (
  productionId: number,
  worklogId: number,
  payload: Partial<FormationWorklogPayload>
): Promise<FormationWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/formation`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * DELETE /production/{productionId}/worklog/{worklogId}/formation - 작업일지 삭제
 */
export const deleteFormationWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/formation`, {
    withCredentials: true,
  });
};
