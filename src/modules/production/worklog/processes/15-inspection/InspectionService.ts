import axios from 'axios';
import type { InspectionWorklog, InspectionWorklogPayload } from './InspectionTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /worklog/inspection - 엑셀 템플릿 다운로드
 */
export const getInspectionTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/inspection`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/inspection - Inspection 작업일지 리스트 조회
 */
export const getInspectionWorklogs = async (productionId: number): Promise<InspectionWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/inspection`, { withCredentials: true });
  return res.data;
};

/**
 * POST /production/{productionId}/worklog/inspection - 작업일지 등록
 */
export const createInspectionWorklog = async (
  productionId: number,
  payload: InspectionWorklogPayload
): Promise<InspectionWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/inspection`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/{worklogId}/inspection - 특정 작업일지 조회
 */
export const getInspectionWorklog = async (productionId: number, worklogId: number): Promise<InspectionWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/inspection`, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * PATCH /production/{productionId}/worklog/{worklogId}/inspection - 작업일지 수정
 */
export const updateInspectionWorklog = async (
  productionId: number,
  worklogId: number,
  payload: Partial<InspectionWorklogPayload>
): Promise<InspectionWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/inspection`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * DELETE /production/{productionId}/worklog/{worklogId}/inspection - 작업일지 삭제
 */
export const deleteInspectionWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/inspection`, {
    withCredentials: true,
  });
};
