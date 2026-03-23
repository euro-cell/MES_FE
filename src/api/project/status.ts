import axios from 'axios';
import type {
  StatusProject,
  ProductionStatusInfo,
  UpdateTargetRequest,
  MonthlyStatusData,
} from '../../modules/project/status/StatusTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** 프로젝트 목록 조회 */
export async function getStatusProjects(): Promise<StatusProject[]> {
  try {
    const response = await axios.get(`${API_BASE}/project`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    throw error;
  }
}

/** 월별 현황 데이터 조회 */
export async function getMonthlyStatusData(
  projectId: number,
  category: string,
  electrodeType: string | null,
  year: number,
  month: number,
): Promise<MonthlyStatusData> {
  // 기본 월간 데이터 구조 반환 (실제 데이터는 getRealMonthlyData에서 조회)
  return {
    projectId,
    category,
    electrodeType: electrodeType as any,
    year,
    month,
    processes: [],
    overallTotal: 0,
    overallProgress: 0,
  };
}

/** 생산 현황 기본 정보 조회 (startDate, endDate) */
export async function getProjectStatusInfo(projectId: number): Promise<ProductionStatusInfo> {
  try {
    const response = await axios.get(`${API_BASE}/project/${projectId}/status`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('생산 현황 정보 조회 실패:', error);
    throw error;
  }
}

/** 실제 데이터 조회 (백엔드 응답 형식 그대로) */
export async function getRealMonthlyData(
  projectId: number,
  category: string,
  electrodeType: string | null,
  year: number,
  month: number,
): Promise<any> {
  try {
    const params = new URLSearchParams({
      month: `${year}-${String(month).padStart(2, '0')}`,
    });
    if (electrodeType) params.append('type', electrodeType);

    const response = await axios.get(`${API_BASE}/project/${projectId}/status/${category}?${params}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 실제 데이터 조회 실패:', error);
    return null;
  }
}

/** 목표수량 수정 API */
export async function updateTargetQuantity(projectId: number, request: UpdateTargetRequest): Promise<void> {
  try {
    await axios.patch(`${API_BASE}/project/${projectId}/status/target`, request, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('목표수량 수정 실패:', error);
    throw error;
  }
}
