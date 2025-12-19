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

// Coating 데이터 조회 (목데이터)
export async function getCoatingData(projectId: number): Promise<CoatingData[]> {
  console.log('Coating 데이터 조회 - projectId:', projectId);

  // TODO: 백엔드 API 연동 시 아래 코드로 교체
  // const response = await axios.get(`${API_BASE}/production/${projectId}/lot/coating`, {
  //   withCredentials: true,
  // });
  // return response.data;

  // 목데이터
  return [
    {
      id: 1,
      coatingDate: '2024-12-15',
      lot: 'CT-241215-001',
      atCoating: { temp: 25, humidity: 45 },
      electrodeSpec: { coatLength: 500, coatingWidth: 200, loadingWeight: 18.5 },
      inspection: {
        aSideCoatWeight: {
          op: { start: 12.36, end: 12.56 },
          mid: { start: 12.44, end: 12.56 },
          gear: { start: 12.39, end: 12.54 },
          webSpeed: 7.0,
          pump: { start: 112.0, end: 112.0 },
        },
        bothCoatWeight: {
          op: { start: 24.72, end: 25.12 },
          mid: { start: 24.88, end: 25.12 },
          gear: { start: 24.78, end: 25.08 },
          webSpeed: 7.0,
          pump: 112.0,
        },
        bothCoatThickness: {
          op: { start: 150, end: 152 },
          mid: { start: 151, end: 153 },
          gear: { start: 149, end: 151 },
        },
        misalignment: 0.5,
      },
      dryingCondition: {
        temperature: {
          zone1: { start: 80, end: 82 },
          zone2: { start: 100, end: 102 },
          zone3: 120,
          zone4: 100,
        },
        supply: {
          zone1: { start: 250, end: 252 },
          zone2: { start: 260, end: 262 },
          zone3: 270,
          zone4: 255,
        },
        exhaust: { zone2: 210, zone4: 205 },
      },
      slurryInfo: { lot: 'SL-241214-001', viscosity: 4500, solidContent: 48 },
      foilInfo: { lot: 'FL-241210-001', type: 'Al', length: 500, width: 210, thickness: 15 },
    },
    {
      id: 2,
      coatingDate: '2024-12-15',
      lot: 'CT-241215-002',
      atCoating: { temp: 25, humidity: 46 },
      electrodeSpec: { coatLength: 500, coatingWidth: 200, loadingWeight: 18.3 },
      inspection: {
        aSideCoatWeight: {
          op: { start: 12.3, end: 12.5 },
          mid: { start: 12.38, end: 12.48 },
          gear: { start: 12.32, end: 12.46 },
          webSpeed: 7.0,
          pump: { start: 110.0, end: 110.0 },
        },
        bothCoatWeight: {
          op: { start: 24.6, end: 25.0 },
          mid: { start: 24.76, end: 24.96 },
          gear: { start: 24.64, end: 24.92 },
          webSpeed: 7.0,
          pump: 110.0,
        },
        bothCoatThickness: {
          op: { start: 148, end: 150 },
          mid: { start: 149, end: 151 },
          gear: { start: 147, end: 149 },
        },
        misalignment: 0.4,
      },
      dryingCondition: {
        temperature: {
          zone1: { start: 80, end: 81 },
          zone2: { start: 100, end: 101 },
          zone3: 120,
          zone4: 100,
        },
        supply: {
          zone1: { start: 250, end: 251 },
          zone2: { start: 260, end: 261 },
          zone3: 270,
          zone4: 255,
        },
        exhaust: { zone2: 210, zone4: 205 },
      },
      slurryInfo: { lot: 'SL-241214-001', viscosity: 4520, solidContent: 48 },
      foilInfo: { lot: 'FL-241210-002', type: 'Al', length: 500, width: 210, thickness: 15 },
    },
    {
      id: 3,
      coatingDate: '2024-12-16',
      lot: 'CT-241216-001',
      atCoating: { temp: 24, humidity: 48 },
      electrodeSpec: { coatLength: 480, coatingWidth: 195, loadingWeight: 17.8 },
      inspection: {
        aSideCoatWeight: {
          op: { start: 11.8, end: 12.0 },
          mid: { start: 11.88, end: 11.98 },
          gear: { start: 11.82, end: 11.96 },
          webSpeed: 6.8,
          pump: { start: 108.0, end: 108.0 },
        },
        bothCoatWeight: {
          op: { start: 23.6, end: 24.0 },
          mid: { start: 23.76, end: 23.96 },
          gear: { start: 23.64, end: 23.92 },
          webSpeed: 6.8,
          pump: 108.0,
        },
        bothCoatThickness: {
          op: { start: 145, end: 147 },
          mid: { start: 146, end: 148 },
          gear: { start: 144, end: 146 },
        },
        misalignment: 0.6,
      },
      dryingCondition: {
        temperature: {
          zone1: { start: 75, end: 76 },
          zone2: { start: 95, end: 96 },
          zone3: 115,
          zone4: 95,
        },
        supply: {
          zone1: { start: 240, end: 241 },
          zone2: { start: 250, end: 251 },
          zone3: 260,
          zone4: 245,
        },
        exhaust: { zone2: 205, zone4: 200 },
      },
      slurryInfo: { lot: 'SL-241215-002', viscosity: 4300, solidContent: 47 },
      foilInfo: { lot: 'FL-241212-001', type: 'Cu', length: 480, width: 205, thickness: 12 },
    },
  ];
}

// Calendering 데이터 조회 (목데이터)
export async function getCalenderingData(projectId: number): Promise<CalenderingData[]> {
  console.log('Calendering 데이터 조회 - projectId:', projectId);

  // TODO: 백엔드 API 연동 시 아래 코드로 교체
  // const response = await axios.get(`${API_BASE}/production/${projectId}/lot/calendering`, {
  //   withCredentials: true,
  // });
  // return response.data;

  // 목데이터
  return [
    {
      id: 1,
      calenderingDate: '2024-12-17',
      lot: 'CL-241217-001',
      atCalendering: { temp: 25, humidity: 45 },
      calenderingLen: 450,
      electrodeSpec: { pressingThick: 120, loadingWeight: 18.5 },
      realInspection: {
        conditions: 'Normal',
        pressingTemp: 85,
        thickness: {
          op: { start: 118, end: 120 },
          mid: { start: 119, end: 121 },
          gear: { start: 117, end: 119 },
        },
        coatWeight: { spec: 18.5, p1: 18.3, p3: 18.4, p4: 18.6 },
      },
    },
    {
      id: 2,
      calenderingDate: '2024-12-17',
      lot: 'CL-241217-002',
      atCalendering: { temp: 25, humidity: 46 },
      calenderingLen: 460,
      electrodeSpec: { pressingThick: 118, loadingWeight: 18.3 },
      realInspection: {
        conditions: 'Normal',
        pressingTemp: 84,
        thickness: {
          op: { start: 116, end: 118 },
          mid: { start: 117, end: 119 },
          gear: { start: 115, end: 117 },
        },
        coatWeight: { spec: 18.3, p1: 18.1, p3: 18.2, p4: 18.4 },
      },
    },
    {
      id: 3,
      calenderingDate: '2024-12-18',
      lot: 'CL-241218-001',
      atCalendering: { temp: 24, humidity: 48 },
      calenderingLen: 440,
      electrodeSpec: { pressingThick: 115, loadingWeight: 17.8 },
      realInspection: {
        conditions: 'Normal',
        pressingTemp: 82,
        thickness: {
          op: { start: 113, end: 115 },
          mid: { start: 114, end: 116 },
          gear: { start: 112, end: 114 },
        },
        coatWeight: { spec: 17.8, p1: 17.6, p3: 17.7, p4: 17.9 },
      },
    },
  ];
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

// Notching 데이터 조회 (목데이터)
export async function getNotchingData(projectId: number): Promise<NotchingData[]> {
  console.log('Notching 데이터 조회 - projectId:', projectId);

  // TODO: 백엔드 API 연동 시 아래 코드로 교체
  // const response = await axios.get(`${API_BASE}/production/${projectId}/lot/notching`, {
  //   withCredentials: true,
  // });
  // return response.data;

  // 목데이터
  return [
    {
      id: 1,
      notchingDate: '2024-12-21',
      lot: 'NT-241221-001',
      atNotching: { temp: 25, humidity: 45 },
      electrodeSpec: { overTab: 3.5, wide: 85, length: 400, missMatch: 0.3 },
      production: { totalOutput: 1200, defective: 12, quantity: 1188, fractionDefective: 1.0 },
    },
    {
      id: 2,
      notchingDate: '2024-12-21',
      lot: 'NT-241221-002',
      atNotching: { temp: 25, humidity: 46 },
      electrodeSpec: { overTab: 3.4, wide: 85, length: 410, missMatch: 0.2 },
      production: { totalOutput: 1150, defective: 8, quantity: 1142, fractionDefective: 0.7 },
    },
    {
      id: 3,
      notchingDate: '2024-12-22',
      lot: 'NT-241222-001',
      atNotching: { temp: 24, humidity: 48 },
      electrodeSpec: { overTab: 3.6, wide: 90, length: 395, missMatch: 0.4 },
      production: { totalOutput: 1100, defective: 15, quantity: 1085, fractionDefective: 1.4 },
    },
  ];
}

// Stacking 데이터 조회 (목데이터)
export async function getStackingData(projectId: number): Promise<StackingData[]> {
  console.log('Stacking 데이터 조회 - projectId:', projectId);

  // TODO: 백엔드 API 연동 시 아래 코드로 교체
  // const response = await axios.get(`${API_BASE}/production/${projectId}/lot/stacking`, {
  //   withCredentials: true,
  // });
  // return response.data;

  // 목데이터
  return [
    {
      id: 1,
      productionDate: '2024-12-23',
      lot: 'ST-241223-001',
      atStacking: { temp: 25, humidity: 45 },
      jellyrollSpec: { stack: '양', weight: 'P', thickness: 'P', alignment: 'P', ir: 'P' },
      magazine: {
        notchingAnode: { row1: 'NT-A-001', row2: 'NT-A-002' },
        notchingCathode: { row1: 'NT-C-001', row2: 'NT-C-002' },
        separate: 'SEP-001',
      },
    },
    {
      id: 2,
      productionDate: '2024-12-23',
      lot: 'ST-241223-002',
      atStacking: { temp: 25, humidity: 46 },
      jellyrollSpec: { stack: '음', weight: 'P', thickness: 'NP', alignment: 'P', ir: 'P' },
      magazine: {
        notchingAnode: { row1: 'NT-A-003', row2: 'NT-A-004' },
        notchingCathode: { row1: 'NT-C-003', row2: 'NT-C-004' },
        separate: 'SEP-002',
      },
    },
    {
      id: 3,
      productionDate: '2024-12-24',
      lot: 'ST-241224-001',
      atStacking: { temp: 24, humidity: 48 },
      jellyrollSpec: { stack: '양', weight: 'NP', thickness: 'P', alignment: 'NP', ir: 'P' },
      magazine: {
        notchingAnode: { row1: 'NT-A-005', row2: 'NT-A-006' },
        notchingCathode: { row1: 'NT-C-005', row2: 'NT-C-006' },
        separate: 'SEP-003',
      },
    },
  ];
}

// Welding 데이터 조회 (목데이터)
export async function getWeldingData(projectId: number): Promise<WeldingData[]> {
  console.log('Welding 데이터 조회 - projectId:', projectId);

  // TODO: 백엔드 API 연동 시 아래 코드로 교체
  // const response = await axios.get(`${API_BASE}/production/${projectId}/lot/welding`, {
  //   withCredentials: true,
  // });
  // return response.data;

  // 목데이터
  return [
    {
      id: 1,
      weldingDate: '2024-12-25',
      lot: 'WD-241225-001',
      atWelding: { temp: 25, humidity: 45 },
      preWelding: { weldingPosition: 'P', trimPosition: 'P' },
      mainWelding: { weldingPosition: 'P', irCheck: 'P', taping: 'P' },
    },
    {
      id: 2,
      weldingDate: '2024-12-25',
      lot: 'WD-241225-002',
      atWelding: { temp: 25, humidity: 46 },
      preWelding: { weldingPosition: 'P', trimPosition: 'N' },
      mainWelding: { weldingPosition: 'P', irCheck: 'P', taping: 'P' },
    },
    {
      id: 3,
      weldingDate: '2024-12-26',
      lot: 'WD-241226-001',
      atWelding: { temp: 24, humidity: 48 },
      preWelding: { weldingPosition: 'N', trimPosition: 'P' },
      mainWelding: { weldingPosition: 'P', irCheck: 'N', taping: 'P' },
    },
  ];
}

// Sealing/Filling 데이터 조회 (목데이터)
export async function getSealingData(projectId: number): Promise<SealingData[]> {
  console.log('Sealing/Filling 데이터 조회 - projectId:', projectId);

  // TODO: 백엔드 API 연동 시 아래 코드로 교체
  // const response = await axios.get(`${API_BASE}/production/${projectId}/lot/sealing`, {
  //   withCredentials: true,
  // });
  // return response.data;

  // 목데이터
  return [
    {
      id: 1,
      fillingDate: '2024-12-27',
      lot: 'SF-241227-001',
      atAssy: { temp: 25, humidity: 45 },
      topSealing: { sealantHeight: 'P', pouchSealingThickness: 150, tabSealingThickness: 145, visualInspection: 'P' },
      sideSealing: { pouchSealingThickness: 148, sideBottomSealingWidth: 'P', visualInspection: 'P', irCheck: 'P' },
      filling: { injection: '2024-12-27', lot: 'EL-241225-001' },
      production: { lot: 'PC-241227-001' },
    },
    {
      id: 2,
      fillingDate: '2024-12-27',
      lot: 'SF-241227-002',
      atAssy: { temp: 25, humidity: 46 },
      topSealing: { sealantHeight: 'P', pouchSealingThickness: 152, tabSealingThickness: 147, visualInspection: 'P' },
      sideSealing: { pouchSealingThickness: 150, sideBottomSealingWidth: 'NP', visualInspection: 'P', irCheck: 'P' },
      filling: { injection: '2024-12-27', lot: 'EL-241225-002' },
      production: { lot: 'PC-241227-002' },
    },
    {
      id: 3,
      fillingDate: '2024-12-28',
      lot: 'SF-241228-001',
      atAssy: { temp: 24, humidity: 48 },
      topSealing: { sealantHeight: 'NP', pouchSealingThickness: 148, tabSealingThickness: 143, visualInspection: 'NP' },
      sideSealing: { pouchSealingThickness: 146, sideBottomSealingWidth: 'P', visualInspection: 'P', irCheck: 'NP' },
      filling: { injection: '2024-12-28', lot: 'EL-241226-001' },
      production: { lot: 'PC-241228-001' },
    },
  ];
}
