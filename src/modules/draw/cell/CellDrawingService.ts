import axios from 'axios';
import type { CellDrawingProject } from './CellDrawingTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** 셀 도면 프로젝트 목록 조회 */
export const getCellDrawingProjects = async (): Promise<CellDrawingProject[]> => {
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  return res.data;
};
