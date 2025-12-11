import axios from 'axios';
import type { PressWorklog, PressWorklogPayload } from './PressTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Excel 템플릿 다운로드
export const getPressTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/press`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

// Press 작업일지 목록 조회
export const getPressWorklogs = async (projectId: number): Promise<PressWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/press`, {
    withCredentials: true,
  });
  return res.data;
};

// Press 작업일지 단건 조회
export const getPressWorklog = async (projectId: number, worklogId: number): Promise<PressWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/press/${worklogId}`, {
    withCredentials: true,
  });
  return res.data;
};

// Press 작업일지 등록
export const createPressWorklog = async (
  productionId: number,
  payload: PressWorklogPayload
): Promise<PressWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/press`, payload, {
    withCredentials: true,
  });
  return res.data;
};

// Press 작업일지 수정
export const updatePressWorklog = async (
  productionId: number,
  worklogId: number,
  payload: PressWorklogPayload
): Promise<PressWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/press/${worklogId}`, payload, {
    withCredentials: true,
  });
  return res.data;
};

// Press 작업일지 삭제
export const deletePressWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${projectId}/worklog/press/${worklogId}`, {
    withCredentials: true,
  });
};
