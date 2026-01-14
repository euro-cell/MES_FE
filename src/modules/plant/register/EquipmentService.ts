import axios from 'axios';
import type { Equipment, EquipmentPayload, EquipmentCategory } from './EquipmentTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** 카테고리 한글 → 영문 변환 */
const CATEGORY_MAP: Record<EquipmentCategory, string> = {
  '생산': 'production',
  '개발': 'development',
  '측정': 'measurement',
};

/** 설비 목록 조회 */
export const getEquipments = async (category: EquipmentCategory): Promise<Equipment[]> => {
  const res = await axios.get(`${API_BASE}/equipment`, {
    params: { category: CATEGORY_MAP[category] },
    withCredentials: true,
  });
  return res.data;
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
  const sanitized = sanitizePayload(payload);
  const res = await axios.patch(`${API_BASE}/equipment/${id}`, sanitized, { withCredentials: true });
  return res.data;
};

/** 설비 삭제 */
export const deleteEquipment = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/equipment/${id}`, { withCredentials: true });
};
