import axios from '../../axiosInstance';
import type { ElectrodeMaterial, ElectrodeMaterialInput } from '../../../modules/stock/material/electrode/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getElectrodeMaterials = async (isZeroStock: boolean = false): Promise<ElectrodeMaterial[]> => {
  try {
    const response = await axios.get<ElectrodeMaterial[]>(`${API_BASE}/material/electrode`, {
      params: { isZeroStock },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 전극 자재 조회 실패:', error);
    throw error;
  }
};

export const createElectrodeMaterial = async (material: ElectrodeMaterialInput) => {
  try {
    const response = await axios.post<ElectrodeMaterial>(`${API_BASE}/material/electrode`, material, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 전극 자재 생성 실패:', error);
    throw error;
  }
};

export const updateElectrodeMaterial = async (id: number, material: ElectrodeMaterialInput) => {
  try {
    const response = await axios.patch<ElectrodeMaterial>(`${API_BASE}/material/electrode/${id}`, material, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 전극 자재 수정 실패:', error);
    throw error;
  }
};

export const deleteElectrodeMaterial = async (id: number, isHardDelete: boolean = false) => {
  try {
    const response = await axios.delete<ElectrodeMaterial>(`${API_BASE}/material/electrode/${id}`, {
      params: { hardDelete: isHardDelete },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 전극 자재 삭제 실패:', error);
    throw error;
  }
};

export const getElectrodeHistory = async (page: number = 1, limit: number = 20) => {
  try {
    const response = await axios.get(`${API_BASE}/material/history/electrode`, {
      params: { page, limit },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 전극 입/출고 이력 조회 실패:', error);
    throw error;
  }
};

/** 전극 자재 엑셀 업로드 (Upsert: lot + category 조합으로 식별) */
export interface MaterialImportData {
  category: string;
  type: string;
  purpose: string;
  name: string;
  spec?: string;
  lotNo?: string;
  company?: string;
  origin: string;
  unit: string;
  price?: number;
  note?: string;
  stock?: number;
}

export const importElectrodeMaterials = async (
  data: MaterialImportData[]
): Promise<{ created: number; updated: number }> => {
  try {
    const response = await axios.post<{ created: number; updated: number }>(
      `${API_BASE}/material/electrode/import`,
      { materials: data },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('❌ 전극 자재 업로드 실패:', error);
    throw error;
  }
};

export const deleteElectrodeHistories = async (ids: number[]): Promise<void> => {
  await axios.delete(`${API_BASE}/material/history/electrode`, {
    data: { ids },
    withCredentials: true,
  });
};

export const deleteAllElectrodeHistories = async (): Promise<void> => {
  await axios.delete(`${API_BASE}/material/history/electrode/all`, {
    withCredentials: true,
  });
};

/** 전극 자재 엑셀 다운로드 */
export const downloadElectrodeExcel = async (): Promise<void> => {
  const res = await axios.get(`${API_BASE}/material/electrode/export`, {
    withCredentials: true,
    responseType: 'blob',
  });

  // 파일명 추출 (Content-Disposition 헤더에서)
  const contentDisposition = res.headers['content-disposition'];
  let filename = '전극_원자재_관리대장.xlsx';
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
