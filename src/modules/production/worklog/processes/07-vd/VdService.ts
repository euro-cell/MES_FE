import axios from 'axios';
import type { VdWorklog, VdWorklogPayload } from './VdTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Excel 템플릿 다운로드
export const getVdTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/vd`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

// VD 작업일지 목록 조회
export const getVdWorklogs = async (projectId: number): Promise<VdWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/vd`, {
    withCredentials: true,
  });
  return res.data;
};

// VD 작업일지 단건 조회
export const getVdWorklog = async (projectId: number, worklogId: number): Promise<VdWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/${worklogId}/vd`, {
    withCredentials: true,
  });
  return res.data;
};

// VD 작업일지 등록
export const createVdWorklog = async (productionId: number, payload: VdWorklogPayload): Promise<VdWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/vd`, payload, {
    withCredentials: true,
  });
  return res.data;
};

// VD 작업일지 수정
export const updateVdWorklog = async (
  productionId: number,
  worklogId: number,
  payload: VdWorklogPayload
): Promise<VdWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/vd`, payload, {
    withCredentials: true,
  });
  return res.data;
};

// VD 작업일지 삭제
export const deleteVdWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${projectId}/worklog/${worklogId}/vd`, {
    withCredentials: true,
  });
};
