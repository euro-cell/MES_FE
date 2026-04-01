import axios from '../axiosInstance';
import type { Equipment, EquipmentPayload, EquipmentCategory } from '../../modules/plant/register/EquipmentTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** 카테고리 한글 → 영문 변환 */
const CATEGORY_MAP: Record<EquipmentCategory, string> = {
  생산: 'production',
  개발: 'development',
  측정: 'measurement',
};

/** 설비 목록 조회 */
export const getEquipments = async (category: EquipmentCategory): Promise<Equipment[]> => {
  const res = await axios.get(`${API_BASE}/equipment`, {
    params: { category: CATEGORY_MAP[category] },
    withCredentials: true,
  });
  return res.data;
};

/** Mixer 설비 목록 조회 (category=production, 이름에 "Mixer" 포함) */
export const getMixerEquipments = async (): Promise<Equipment[]> => {
  const res = await axios.get(`${API_BASE}/equipment/mixers`, {
    params: { category: 'production' },
    withCredentials: true,
  });
  return res.data;
};

/** 라인(공정 카테고리별) 설비 목록 조회 */
export const getLineEquipments = async (
  processCategory: 'Electrode' | 'Assembly' | 'Formation',
): Promise<Equipment[]> => {
  const res = await axios.get(`${API_BASE}/equipment/lines`, {
    params: { category: processCategory },
    withCredentials: true,
  });
  return res.data;
};

/** 빈 문자열을 null로 변환 */
const sanitizePayload = (payload: EquipmentPayload) => {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value]));
};

/** 설비 등록 */
export const createEquipment = async (payload: EquipmentPayload): Promise<Equipment> => {
  const sanitized = sanitizePayload(payload);
  const res = await axios.post(`${API_BASE}/equipment`, sanitized, { withCredentials: true });
  return res.data;
};

/** 설비 수정 */
export const updateEquipment = async (id: number, payload: EquipmentPayload): Promise<Equipment> => {
  const sanitized = sanitizePayload(payload);
  const res = await axios.patch(`${API_BASE}/equipment/${id}`, sanitized, { withCredentials: true });
  return res.data;
};

/** 설비 삭제 */
export const deleteEquipment = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/equipment/${id}`, { withCredentials: true });
};

/** 설비 목록 엑셀 다운로드 */
export const downloadEquipmentExcel = async (category: EquipmentCategory): Promise<void> => {
  const res = await axios.get(`${API_BASE}/equipment/export`, {
    params: { category: CATEGORY_MAP[category] },
    withCredentials: true,
    responseType: 'blob',
  });

  // 파일명 추출 (Content-Disposition 헤더에서)
  const contentDisposition = res.headers['content-disposition'];
  let filename = `${category}_설비_관리대장.xlsx`;
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
