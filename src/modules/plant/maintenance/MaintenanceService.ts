import axios from 'axios';
import type { MaintenanceRecord, MaintenancePayload } from './MaintenanceTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

/** 빈 문자열을 null로 변환 */
const sanitizePayload = (payload: MaintenancePayload) => {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value]));
};

/** 유지보수 기록 목록 조회 (Mock) */
export const getMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  return [...mockRecords];
};

/** 유지보수 기록 등록 */
export const createMaintenanceRecord = async (payload: MaintenancePayload): Promise<MaintenanceRecord> => {
  const sanitized = sanitizePayload(payload);
  const res = await axios.post(`${API_BASE}/equipment/maintenance`, sanitized, {
    withCredentials: true,
  });
  return res.data;
};

/** 유지보수 기록 수정 */
export const updateMaintenanceRecord = async (
  _id: number,
  _payload: MaintenancePayload
): Promise<MaintenanceRecord> => {
  throw new Error('Not implemented');
};

/** 유지보수 기록 삭제 */
export const deleteMaintenanceRecord = async (_id: number): Promise<void> => {
  throw new Error('Not implemented');
};
