import axios from 'axios';
import type { BinderWorklog, BinderWorklogPayload } from './BinderTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /worklog/binder - 엑셀 템플릿 다운로드
 */
export const getBinderTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/binder`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/binder - Binder 작업일지 리스트 조회
 */
export const getBinderWorklogs = async (productionId: number): Promise<BinderWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/binder`, { withCredentials: true });
  return res.data;
};

/**
 * POST /production/{productionId}/worklog/binder - 작업일지 등록
 */
export const createBinderWorklog = async (
  productionId: number,
  payload: BinderWorklogPayload
): Promise<BinderWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/binder`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * GET /production/{productionId}/worklog/{worklogId}/binder - 특정 작업일지 조회
 */
export const getBinderWorklog = async (productionId: number, worklogId: number): Promise<BinderWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/binder`, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * PATCH /production/{productionId}/worklog/{worklogId}/binder - 작업일지 수정
 */
export const updateBinderWorklog = async (
  productionId: number,
  worklogId: number,
  payload: Partial<BinderWorklogPayload>
): Promise<BinderWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/binder`, payload, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * DELETE /production/{productionId}/worklog/{worklogId}/binder - 작업일지 삭제
 * TODO: 백엔드 구현 대기
 */
export const deleteBinderWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  // await axios.delete(
  //   `${API_BASE}/production/${productionId}/worklog/${worklogId}/binder`,
  //   { withCredentials: true }
  // );

  console.log('🗑️ [MOCK] Delete Binder worklog:', { productionId, worklogId });
  throw new Error('API not implemented - DELETE /production/{productionId}/worklog/{worklogId}/binder');
};
