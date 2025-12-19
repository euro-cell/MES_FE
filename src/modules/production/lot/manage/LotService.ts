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
  DegassingData,
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
      preFormation: { equipment: '1호기', chNo: '양', pfc: 3.2, rfd: 3.1, forEff1: 96.8 },
      finalSealing: { pouchSealingThickness: 150, sideBottomSealingWidth: 'P' },
      finalLot: 'FL-241229-001',
      mainFormation: { equipment: '2호기', chNo: '양', mfc: 3.15 },
      ocvIr1: { ocv1: 3.65, ir1: 25.3 },
      aging4Days: { ocv2_4: 3.62, ir2_4: 24.8 },
      aging7Days: { ocv2_7: 3.60, ir2_7: 24.5, deltaV: 0.02 },
      grading: { equipment: '3호기', chNo: '양', mfd: 3.18, formEff2: 97.2, stc: 3.15, std: 3.12, formEff3: 98.1, temp: 25, wh: 11.5, nominalV: 3.63 },
      soc: { capacity: 3.16, soc: 95.5, dcIr: 23.2 },
      ocvIr3: { ocv3: 3.58, ir3: 24.1 },
    },
    {
      id: 2,
      date: '2024-12-29',
      assyLot: 'AS-241229-002',
      formationLot: 'FM-241229-002',
      preFormation: { equipment: '1호기', chNo: '음', pfc: 3.3, rfd: 3.2, forEff1: 97.0 },
      finalSealing: { pouchSealingThickness: 152, sideBottomSealingWidth: 'P' },
      finalLot: 'FL-241229-002',
      mainFormation: { equipment: '2호기', chNo: '음', mfc: 3.18 },
      ocvIr1: { ocv1: 3.66, ir1: 25.0 },
      aging4Days: { ocv2_4: 3.63, ir2_4: 24.5 },
      aging7Days: { ocv2_7: 3.61, ir2_7: 24.2, deltaV: 0.02 },
      grading: { equipment: '3호기', chNo: '음', mfd: 3.20, formEff2: 97.5, stc: 3.17, std: 3.14, formEff3: 98.3, temp: 25, wh: 11.6, nominalV: 3.64 },
      soc: { capacity: 3.18, soc: 96.0, dcIr: 22.8 },
      ocvIr3: { ocv3: 3.59, ir3: 23.8 },
    },
    {
      id: 3,
      date: '2024-12-30',
      assyLot: 'AS-241230-001',
      formationLot: 'FM-241230-001',
      preFormation: { equipment: '2호기', chNo: '양', pfc: 3.1, rfd: 3.0, forEff1: 96.5 },
      finalSealing: { pouchSealingThickness: 148, sideBottomSealingWidth: 'NP' },
      finalLot: 'FL-241230-001',
      mainFormation: { equipment: '1호기', chNo: '양', mfc: 3.12 },
      ocvIr1: { ocv1: 3.64, ir1: 25.5 },
      aging4Days: { ocv2_4: 3.61, ir2_4: 25.0 },
      aging7Days: { ocv2_7: 3.59, ir2_7: 24.8, deltaV: 0.02 },
      grading: { equipment: '2호기', chNo: '양', mfd: 3.15, formEff2: 96.8, stc: 3.12, std: 3.10, formEff3: 97.8, temp: 24, wh: 11.3, nominalV: 3.62 },
      soc: { capacity: 3.14, soc: 95.0, dcIr: 23.5 },
      ocvIr3: { ocv3: 3.57, ir3: 24.3 },
    },
  ];
}

// Degassing 데이터 조회 (목데이터)
export async function getDegassingData(projectId: number): Promise<DegassingData[]> {
  console.log('Degassing 데이터 조회 - projectId:', projectId);

  // TODO: 백엔드 API 연동 시 아래 코드로 교체
  // const response = await axios.get(`${API_BASE}/production/${projectId}/lot/degassing`, {
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
      finalLot: 'FL-241229-001',
      formation: { type: 'A', year: '2024', month: '12', day: '29', cellNo: ['1', '2', '3', '4'] },
      finalSealing: { pouchSealingThickness: 150, sideBottomSealingWidth: 'P', visualInspection: 'P' },
    },
    {
      id: 2,
      date: '2024-12-29',
      assyLot: 'AS-241229-002',
      formationLot: 'FM-241229-002',
      finalLot: 'FL-241229-002',
      formation: { type: 'B', year: '2024', month: '12', day: '29', cellNo: ['5', '6', '7', '8'] },
      finalSealing: { pouchSealingThickness: 152, sideBottomSealingWidth: 'P', visualInspection: 'P' },
    },
    {
      id: 3,
      date: '2024-12-30',
      assyLot: 'AS-241230-001',
      formationLot: 'FM-241230-001',
      finalLot: 'FL-241230-001',
      formation: { type: 'A', year: '2024', month: '12', day: '30', cellNo: ['9', '0', '1', '2'] },
      finalSealing: { pouchSealingThickness: 148, sideBottomSealingWidth: 'NP', visualInspection: 'P' },
    },
  ];
}
