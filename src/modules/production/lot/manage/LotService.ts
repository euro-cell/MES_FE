import axios from 'axios';
import type { LotProject } from '../LotTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// 프로젝트 목록 조회
export async function getLotProjects(): Promise<LotProject[]> {
  try {
    const response = await axios.get(`${API_BASE}/production`, {
      withCredentials: true,
    });
    return response.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      startDate: p.startDate,
      endDate: p.endDate,
    }));
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    return [];
  }
}

// 프로젝트 정보 조회
export async function getProjectInfo(projectId: number): Promise<LotProject | null> {
  try {
    const projects = await getLotProjects();
    return projects.find(p => p.id === projectId) || null;
  } catch (error) {
    console.error('프로젝트 정보 조회 실패:', error);
    return null;
  }
}
