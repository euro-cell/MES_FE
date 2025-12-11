import axios from 'axios';
import type { FormingWorklog, FormingWorklogPayload } from './FormingTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Excel 템플릿 다운로드
export const getFormingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/forming`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

// Forming 작업일지 목록 조회
export const getFormingWorklogs = async (projectId: number): Promise<FormingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/forming`, {
    withCredentials: true,
  });
  return res.data;
};

// Forming 작업일지 단건 조회
export const getFormingWorklog = async (projectId: number, worklogId: number): Promise<FormingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/forming/${worklogId}`, {
    withCredentials: true,
  });
  return res.data;
};

// Forming 작업일지 등록
export const createFormingWorklog = async (
  productionId: number,
  payload: FormingWorklogPayload
): Promise<FormingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/forming`, payload, {
    withCredentials: true,
  });
  return res.data;
};

// Forming 작업일지 수정
export const updateFormingWorklog = async (
  productionId: number,
  worklogId: number,
  payload: FormingWorklogPayload
): Promise<FormingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/forming/${worklogId}`, payload, {
    withCredentials: true,
  });
  return res.data;
};

// Forming 작업일지 삭제
export const deleteFormingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${projectId}/worklog/forming/${worklogId}`, {
    withCredentials: true,
  });
};
