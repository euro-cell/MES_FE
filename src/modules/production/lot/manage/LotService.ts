import axios from 'axios';
import type {
  LotProject,
  MixingData,
  CoatingData,
  CalenderingData,
  SlittingData,
  NotchingData,
  StackingData,
  WeldingData,
  SealingData,
  FormationData,
  SyncStatus,
} from '../LotTypes';

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

// Lot 데이터 동기화
export async function syncLotData(projectId: number, process: string): Promise<void> {
  try {
    await axios.post(`${API_BASE}/production/${projectId}/lot/sync`, null, {
      params: { process: process.toLowerCase() },
      withCredentials: true,
    });
  } catch (error) {
    console.error('Lot 데이터 동기화 실패:', error);
    throw error;
  }
}

// Sync 상태 조회
export async function getSyncStatus(projectId: number, process: string): Promise<SyncStatus | null> {
  try {
    const response = await axios.get(`${API_BASE}/production/${projectId}/lot/sync`, {
      params: { process: process.toLowerCase() },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Sync 상태 조회 실패:', error);
    return null;
  }
}

// Mixing 데이터 조회
export async function getMixingData(projectId: number): Promise<MixingData[]> {
  try {
    const response = await axios.get(`${API_BASE}/production/${projectId}/lot/mixing`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Mixing 데이터 조회 실패:', error);
    return [];
  }
}

// Coating 데이터 조회
export async function getCoatingData(projectId: number): Promise<CoatingData[]> {
  try {
    const response = await axios.get(`${API_BASE}/production/${projectId}/lot/coating`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Coating 데이터 조회 실패:', error);
    return [];
  }
}

// Calendering 데이터 조회
export async function getCalenderingData(projectId: number): Promise<CalenderingData[]> {
  try {
    const response = await axios.get(`${API_BASE}/production/${projectId}/lot/calendering`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Calendering 데이터 조회 실패:', error);
    return [];
  }
}

// Slitting 데이터 조회 (목데이터)
export async function getSlittingData(projectId: number): Promise<SlittingData[]> {
  console.log('Slitting 데이터 조회 - projectId:', projectId);

  // TODO: 백엔드 API 연동 시 아래 코드로 교체
  // const response = await axios.get(`${API_BASE}/production/${projectId}/lot/slitting`, {
  //   withCredentials: true,
  // });
  // return response.data;

  // 목데이터
  return [
    {
      id: 1,
      slittingDate: '2024-12-19',
      lot: 'SL-241219-001',
      atSlitting: { temp: 25, humidity: 45 },
      slittingLength: 420,
      slittingWidth: 85,
    },
    {
      id: 2,
      slittingDate: '2024-12-19',
      lot: 'SL-241219-002',
      atSlitting: { temp: 25, humidity: 46 },
      slittingLength: 430,
      slittingWidth: 85,
    },
    {
      id: 3,
      slittingDate: '2024-12-20',
      lot: 'SL-241220-001',
      atSlitting: { temp: 24, humidity: 48 },
      slittingLength: 410,
      slittingWidth: 90,
    },
  ];
}

// Notching 데이터 조회
export async function getNotchingData(projectId: number): Promise<NotchingData[]> {
  try {
    const response = await axios.get(`${API_BASE}/production/${projectId}/lot/notching`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Notching 데이터 조회 실패:', error);
    return [];
  }
}

// Stacking 데이터 조회
export async function getStackingData(projectId: number): Promise<StackingData[]> {
  try {
    const response = await axios.get(`${API_BASE}/production/${projectId}/lot/stacking`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Stacking 데이터 조회 실패:', error);
    return [];
  }
}

// Welding 데이터 조회
export async function getWeldingData(projectId: number): Promise<WeldingData[]> {
  try {
    const response = await axios.get(`${API_BASE}/production/${projectId}/lot/welding`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Welding 데이터 조회 실패:', error);
    return [];
  }
}

// Sealing/Filling 데이터 조회
export async function getSealingData(projectId: number): Promise<SealingData[]> {
  try {
    const response = await axios.get(`${API_BASE}/production/${projectId}/lot/sealing`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Sealing 데이터 조회 실패:', error);
    return [];
  }
}

// Formation 데이터 조회
export async function getFormationData(projectId: number): Promise<FormationData[]> {
  try {
    const response = await axios.get(`${API_BASE}/production/${projectId}/lot/formation`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Formation 데이터 조회 실패:', error);
    return [];
  }
}

// LowData 등록 응답 타입
export interface RegisterLowDataResponse {
  success: boolean;
  message: string;
  results: {
    total: number;
    updated: number;
    created: number;
    skipped: number;
  };
}

// LowData 등록
export async function registerLowData(
  projectId: number,
  headers: string[],
  data: Record<string, any>[],
): Promise<RegisterLowDataResponse> {
  const response = await axios.post(
    `${API_BASE}/production/${projectId}/lot/lowdata`,
    { headers, data },
    { withCredentials: true },
  );
  return response.data;
}

/** Lot 관리 엑셀 다운로드 (모든 공정 데이터 - 각 시트별) */
export async function downloadLotExcel(projectId: number, projectName: string): Promise<void> {
  const res = await axios.get(`${API_BASE}/production/${projectId}/lot/export`, {
    withCredentials: true,
    responseType: 'blob',
  });

  // 파일명 추출 (Content-Disposition 헤더에서)
  const contentDisposition = res.headers['content-disposition'];
  let filename = `${projectName}_Lot_관리대장.xlsx`;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '');
      // URL 디코딩 (한글 파일명 처리)
      filename = decodeURIComponent(filename);
    }
  }

  // Blob으로 다운로드 트리거
  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
