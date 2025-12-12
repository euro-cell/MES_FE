import axios from 'axios';
import type { NotchingWorklog, NotchingWorklogPayload } from './NotchingTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Excel 템플릿 다운로드
export const getNotchingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/notching`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

// Notching 작업일지 목록 조회
export const getNotchingWorklogs = async (projectId: number): Promise<NotchingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/notching`, {
    withCredentials: true,
  });
  return res.data;
};

// Notching 작업일지 단건 조회
export const getNotchingWorklog = async (projectId: number, worklogId: number): Promise<NotchingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/${worklogId}/notching`, {
    withCredentials: true,
  });
  return res.data;
};

// Notching 작업일지 등록
export const createNotchingWorklog = async (
  productionId: number,
  payload: NotchingWorklogPayload
): Promise<NotchingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/notching`, payload, {
    withCredentials: true,
  });
  return res.data;
};

// Notching 작업일지 수정
export const updateNotchingWorklog = async (
  productionId: number,
  worklogId: number,
  payload: NotchingWorklogPayload
): Promise<NotchingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/notching`, payload, {
    withCredentials: true,
  });
  return res.data;
};

// Notching 작업일지 삭제
export const deleteNotchingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${projectId}/worklog/${worklogId}/notching`, {
    withCredentials: true,
  });
};
