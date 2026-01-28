import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface CellInventoryDetail {
  id: number;
  lot: string;
  projectName: string;
  projectNo: string;
  model: string;
  grade: string;
  ncrGrade: string | null;
  date: string;
  storageLocation: string;
  shippingDate: string | null;
  shippingStatus: string | null;
  deliverer: string;
  receiver: string;
  details: string | null;
  isShipped: boolean;
  isRestocked: boolean;
}

export type CellInventoryDetailResponse = CellInventoryDetail[];

export const fetchCellInventoryByProject = async (
  projectName: string
): Promise<CellInventoryDetailResponse> => {
  try {
    const res = await axios.get<CellInventoryDetailResponse>(
      `${API_BASE}/cell-inventory/project?name=${encodeURIComponent(projectName)}`,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (err: any) {
    console.error('❌ 프로젝트별 CellInventory 조회 실패:', err);
    throw err.response?.data || err;
  }
};
