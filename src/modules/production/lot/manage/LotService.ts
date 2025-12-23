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

// Formation 데이터 조회 (목데이터)
export async function getFormationData(projectId: number): Promise<FormationData[]> {
  console.log('Formation 데이터 조회 - projectId:', projectId);

  // TODO: 백엔드 API 연동 시 아래 코드로 교체
  // const response = await axios.get(`${API_BASE}/production/${projectId}/lot/formation`, {
  //   withCredentials: true,
  // });
  // return response.data;

  // 목데이터
  return [
    {
      id: 1,
      date: '2024-12-29',
      assyLot: 'AS-241229-001',
      formationLot: 'FM-241229-001',
      preFormation: { equipment: '1호기', chNo: '1/3', pfc: 3.2, rfd: 3.1, forEff1: 96.8 },
      finalSealing: { pouchSealingThickness: 150, sideBottomSealingWidth: 'P', visualInspection: 'P' },
      finalLot: 'FL-241229-001',
      mainFormation: { equipment: '2호기', chNo: '1/3', mfc: 3.15 },
      ocvIr1: { ocv1: 3.65, ir1: 25.3 },
      aging4Days: { ocv2_4: 3.62, ir2_4: 24.8 },
      aging7Days: { ocv2_7: 3.60, ir2_7: 24.5, deltaV: 0.02 },
      grading: { equipment: '3호기', chNo: '1/3', mfd: 3.18, formEff2: 97.2, stc: 3.15, std: 3.12, formEff3: 98.1, temp: 25, wh: 11.5, nominalV: 3.63 },
      soc: { capacity: 3.16, soc: 95.5, dcIr: 23.2 },
      ocvIr3: { ocv3: 3.58, ir3: 24.1 },
    },
    {
      id: 2,
      date: '2024-12-29',
      assyLot: 'AS-241229-002',
      formationLot: 'FM-241229-002',
      preFormation: { equipment: '1호기', chNo: '2/4', pfc: 3.3, rfd: 3.2, forEff1: 97.0 },
      finalSealing: { pouchSealingThickness: 152, sideBottomSealingWidth: 'P', visualInspection: 'P' },
      finalLot: 'FL-241229-002',
      mainFormation: { equipment: '2호기', chNo: '2/4', mfc: 3.18 },
      ocvIr1: { ocv1: 3.66, ir1: 25.0 },
      aging4Days: { ocv2_4: 3.63, ir2_4: 24.5 },
      aging7Days: { ocv2_7: 3.61, ir2_7: 24.2, deltaV: 0.02 },
      grading: { equipment: '3호기', chNo: '2/4', mfd: 3.20, formEff2: 97.5, stc: 3.17, std: 3.14, formEff3: 98.3, temp: 25, wh: 11.6, nominalV: 3.64 },
      soc: { capacity: 3.18, soc: 96.0, dcIr: 22.8 },
      ocvIr3: { ocv3: 3.59, ir3: 23.8 },
    },
    {
      id: 3,
      date: '2024-12-30',
      assyLot: 'AS-241230-001',
      formationLot: 'FM-241230-001',
      preFormation: { equipment: '2호기', chNo: '3/1', pfc: 3.1, rfd: 3.0, forEff1: 96.5 },
      finalSealing: { pouchSealingThickness: 148, sideBottomSealingWidth: 'NP', visualInspection: 'P' },
      finalLot: 'FL-241230-001',
      mainFormation: { equipment: '1호기', chNo: '3/1', mfc: 3.12 },
      ocvIr1: { ocv1: 3.64, ir1: 25.5 },
      aging4Days: { ocv2_4: 3.61, ir2_4: 25.0 },
      aging7Days: { ocv2_7: 3.59, ir2_7: 24.8, deltaV: 0.02 },
      grading: { equipment: '2호기', chNo: '3/1', mfd: 3.15, formEff2: 96.8, stc: 3.12, std: 3.10, formEff3: 97.8, temp: 24, wh: 11.3, nominalV: 3.62 },
      soc: { capacity: 3.14, soc: 95.0, dcIr: 23.5 },
      ocvIr3: { ocv3: 3.57, ir3: 24.3 },
    },
  ];
}

