import axios from 'axios';
import type { Equipment, EquipmentPayload, EquipmentCategory } from './EquipmentTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Mock 데이터
let mockEquipments: Equipment[] = [
  {
    id: 1,
    category: '생산',
    processType: '전극',
    assetNo: 'A-2024-001',
    equipmentNo: 'EQ-P-001',
    name: 'Coating Machine #1',
    manufacturer: 'ABC Corp',
    purchaseDate: '2024-01-15',
    grade: 'A',
    maintenanceMethod: '정기점검',
    remark: '주력 코팅 설비',
  },
  {
    id: 2,
    category: '생산',
    processType: '조립',
    assetNo: 'A-2024-002',
    equipmentNo: 'EQ-P-002',
    name: 'Press Machine #1',
    manufacturer: 'XYZ Inc',
    purchaseDate: '2024-02-20',
    grade: 'A',
    maintenanceMethod: '정기점검',
  },
  {
    id: 3,
    category: '개발',
    processType: '화성',
    assetNo: 'A-2024-003',
    equipmentNo: 'EQ-D-001',
    name: 'Test Chamber',
    manufacturer: 'DEF Ltd',
    purchaseDate: '2024-03-10',
    grade: 'B',
    maintenanceMethod: '수시점검',
  },
  {
    id: 4,
    category: '측정',
    assetNo: 'A-2024-004',
    equipmentNo: 'EQ-M-001',
    name: 'Digital Caliper',
    manufacturer: 'Mitutoyo',
    purchaseDate: '2024-04-05',
    grade: 'A',
    maintenanceMethod: '교정',
    deviceNo: 'DC-001',
    calibrationDate: '2024-04-05',
    nextCalibrationDate: '2025-04-05',
    calibrationAgency: 'KOLAS 인증기관',
  },
  {
    id: 5,
    category: '측정',
    assetNo: 'A-2024-005',
    equipmentNo: 'EQ-M-002',
    name: 'Thickness Gauge',
    manufacturer: 'Mitutoyo',
    purchaseDate: '2024-05-01',
    grade: 'A',
    maintenanceMethod: '교정',
    deviceNo: 'TG-001',
    calibrationDate: '2024-05-01',
    nextCalibrationDate: '2025-05-01',
    calibrationAgency: 'KOLAS 인증기관',
  },
];

/** 설비 목록 조회 */
export const getEquipments = async (category?: EquipmentCategory): Promise<Equipment[]> => {
  await delay(300);
  if (category) {
    return mockEquipments.filter(e => e.category === category);
  }
  return [...mockEquipments];
};

/** 설비 단건 조회 */
export const getEquipment = async (id: number): Promise<Equipment | undefined> => {
  await delay(200);
  return mockEquipments.find(e => e.id === id);
};

/** 빈 문자열을 null로 변환 */
const sanitizePayload = (payload: EquipmentPayload) => {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value])
  );
};

/** 설비 등록 */
export const createEquipment = async (payload: EquipmentPayload): Promise<Equipment> => {
  const sanitized = sanitizePayload(payload);
  const res = await axios.post(`${API_BASE}/equipment`, sanitized, { withCredentials: true });
  return res.data;
};

/** 설비 수정 */
export const updateEquipment = async (id: number, payload: EquipmentPayload): Promise<Equipment> => {
  await delay(300);
  const index = mockEquipments.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('설비를 찾을 수 없습니다.');
  }
  const updated: Equipment = { ...payload, id };
  mockEquipments[index] = updated;
  return updated;
};

/** 설비 삭제 */
export const deleteEquipment = async (id: number): Promise<void> => {
  await delay(300);
  const index = mockEquipments.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('설비를 찾을 수 없습니다.');
  }
  mockEquipments.splice(index, 1);
};

/** 딜레이 유틸 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
