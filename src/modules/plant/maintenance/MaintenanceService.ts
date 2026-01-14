import type { MaintenanceRecord, MaintenancePayload } from './MaintenanceTypes';

// Mock 데이터
let mockRecords: MaintenanceRecord[] = [
  {
    id: 1,
    equipmentId: 1,
    assetNo: '기계장치-018',
    equipmentNo: 'DM-01',
    equipmentName: '5V200A16CH 충방전기',
    inspectionDate: '2024-01-15',
    replacementHistory: '베어링 교체',
    usedParts: '베어링 SKF-6205',
    maintainer: '김철수',
    verifier: '박영희',
    remark: '정기점검',
  },
  {
    id: 2,
    equipmentId: 1,
    assetNo: '기계장치-018',
    equipmentNo: 'DM-01',
    equipmentName: '5V200A16CH 충방전기',
    inspectionDate: '2024-03-20',
    replacementHistory: '필터 교체',
    usedParts: '에어필터 AF-100',
    maintainer: '이민수',
    verifier: '박영희',
    remark: '',
  },
];

let nextId = 3;

/** 딜레이 유틸 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** 유지보수 기록 목록 조회 */
export const getMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  await delay(300);
  return [...mockRecords];
};

/** 유지보수 기록 등록 */
export const createMaintenanceRecord = async (payload: MaintenancePayload): Promise<MaintenanceRecord> => {
  await delay(300);
  const newRecord: MaintenanceRecord = {
    ...payload,
    id: nextId++,
  };
  mockRecords.push(newRecord);
  return newRecord;
};

/** 유지보수 기록 수정 */
export const updateMaintenanceRecord = async (id: number, payload: MaintenancePayload): Promise<MaintenanceRecord> => {
  await delay(300);
  const index = mockRecords.findIndex(r => r.id === id);
  if (index === -1) {
    throw new Error('기록을 찾을 수 없습니다.');
  }
  const updated: MaintenanceRecord = { ...mockRecords[index], ...payload, id };
  mockRecords[index] = updated;
  return updated;
};

/** 유지보수 기록 삭제 */
export const deleteMaintenanceRecord = async (id: number): Promise<void> => {
  await delay(300);
  const index = mockRecords.findIndex(r => r.id === id);
  if (index === -1) {
    throw new Error('기록을 찾을 수 없습니다.');
  }
  mockRecords.splice(index, 1);
};
