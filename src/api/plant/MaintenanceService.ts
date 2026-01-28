import axios from 'axios';
import type { MaintenanceRecord, MaintenancePayload } from '../../modules/plant/maintenance/MaintenanceTypes';

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

/** 유지보수 기록 엑셀 다운로드 */
export const downloadMaintenanceExcel = async (): Promise<void> => {
  const res = await axios.get(`${API_BASE}/equipment/maintenance/export`, {
    withCredentials: true,
    responseType: 'blob',
  });

  // 파일명 추출 (Content-Disposition 헤더에서)
  const contentDisposition = res.headers['content-disposition'];
  let filename = '유지보수_관리대장.xlsx';
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
};
