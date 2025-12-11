import axios from 'axios';
import type { StackingWorklog, StackingWorklogPayload } from './StackingTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getStackingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/Stacking`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

export const getStackingWorklogs = async (projectId: number): Promise<StackingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/Stacking`, {
    withCredentials: true,
  });
  return res.data;
};

export const getStackingWorklog = async (projectId: number, worklogId: number): Promise<StackingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/${worklogId}/Stacking`, {
    withCredentials: true,
  });
  return res.data;
};

export const createStackingWorklog = async (
  productionId: number,
  payload: StackingWorklogPayload
): Promise<StackingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/Stacking`, payload, {
    withCredentials: true,
  });
  return res.data;
};

export const updateStackingWorklog = async (
  productionId: number,
  worklogId: number,
  payload: Partial<StackingWorklogPayload>
): Promise<StackingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/Stacking`, payload, {
    withCredentials: true,
  });
  return res.data;
};

export const deleteStackingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${projectId}/worklog/${worklogId}/Stacking`, {
    withCredentials: true,
  });
};
