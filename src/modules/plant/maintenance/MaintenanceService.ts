import axios from 'axios';
import type { MaintenanceRecord, MaintenancePayload } from './MaintenanceTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** 빈 문자열을 null로 변환 */
const sanitizePayload = (payload: MaintenancePayload) => {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value]));
};

/** 유지보수 기록 목록 조회 */
export const getMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  const res = await axios.get(`${API_BASE}/equipment/maintenance`, {
    withCredentials: true,
  });
  return res.data;
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
  id: number,
  payload: MaintenancePayload
): Promise<MaintenanceRecord> => {
  const sanitized = sanitizePayload(payload);
  const res = await axios.patch(`${API_BASE}/equipment/maintenance/${id}`, sanitized, {
    withCredentials: true,
  });
  return res.data;
};

/** 유지보수 기록 삭제 */
export const deleteMaintenanceRecord = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/equipment/maintenance/${id}`, {
    withCredentials: true,
  });
};
