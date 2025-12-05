import axios from 'axios';
import type { WorklogProject, WorklogEntry, WorklogPayload } from './WorklogTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** 전체 프로젝트 조회 */
export const getProjects = async (): Promise<WorklogProject[]> => {
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  return res.data;
};

export const getWorklogProjects = async (): Promise<WorklogProject[]> => {
  // TODO: 백엔드 API 구현 시 활성화
  // const res = await axios.get(`${API_BASE}/worklog/projects`, { withCredentials: true });
  // return res.data;

  // 임시 목 데이터
  throw new Error('API not implemented');
};

/** 특정 프로젝트+공정의 작업일지 조회 */
export const getWorklogs = async (projectId: number, processId: string): Promise<WorklogEntry[]> => {
  // TODO: 백엔드 API 구현 시 활성화
  // const res = await axios.get(
  //   `${API_BASE}/worklog/projects/${projectId}/process/${processId}`,
  //   { withCredentials: true }
  // );
  // return res.data;

  // 임시 목 데이터
  throw new Error('API not implemented');
};

/** 작업일지 등록 */
export const createWorklog = async (projectId: number, payload: WorklogPayload): Promise<WorklogEntry> => {
  // TODO: 백엔드 API 구현 시 활성화
  // const res = await axios.post(
  //   `${API_BASE}/worklog/projects/${projectId}`,
  //   payload,
  //   { withCredentials: true }
  // );
  // return res.data;

  throw new Error('API not implemented');
};

/** 작업일지 수정 */
export const updateWorklog = async (worklogId: number, payload: Partial<WorklogPayload>): Promise<WorklogEntry> => {
  // TODO: 백엔드 API 구현 시 활성화
  // const res = await axios.patch(
  //   `${API_BASE}/worklog/${worklogId}`,
  //   payload,
  //   { withCredentials: true }
  // );
  // return res.data;

  throw new Error('API not implemented');
};

/** 작업일지 삭제 */
export const deleteWorklog = async (worklogId: number): Promise<void> => {
  // TODO: 백엔드 API 구현 시 활성화
  // await axios.delete(`${API_BASE}/worklog/${worklogId}`, { withCredentials: true });

  throw new Error('API not implemented');
};
