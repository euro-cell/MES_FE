import axios from '../../axiosInstance';
import type { AssemblyMaterial } from '../../../modules/stock/material/assembly/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getAssemblyMaterials = async (isZeroStock: boolean = false): Promise<AssemblyMaterial[]> => {
  try {
    const response = await axios.get<AssemblyMaterial[]>(`${API_BASE}/material/assembly`, {
      params: { isZeroStock },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 조립 자재 조회 실패:', error);
    throw error;
  }
};

export const createAssemblyMaterial = async (material: Omit<AssemblyMaterial, 'id'>) => {
  try {
    const response = await axios.post<AssemblyMaterial>(`${API_BASE}/material/assembly`, material, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 조립 자재 생성 실패:', error);
    throw error;
  }
};

export const updateAssemblyMaterial = async (id: number, material: Omit<AssemblyMaterial, 'id'>) => {
  try {
    const response = await axios.patch<AssemblyMaterial>(`${API_BASE}/material/assembly/${id}`, material, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 조립 자재 수정 실패:', error);
    throw error;
  }
};

export const deleteAssemblyMaterial = async (id: number, isHardDelete: boolean = false) => {
  try {
    const response = await axios.delete<AssemblyMaterial>(`${API_BASE}/material/assembly/${id}`, {
      params: { hardDelete: isHardDelete },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 조립 자재 삭제 실패:', error);
    throw error;
  }
};

export const getAssemblyHistory = async (page: number = 1, limit: number = 20) => {
  try {
    const response = await axios.get(`${API_BASE}/material/history/assembly`, {
      params: { page, limit },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('❌ 조립 입/출고 이력 조회 실패:', error);
    throw error;
  }
};

/** 조립 자재 엑셀 업로드 (Upsert: lot + category 조합으로 식별) */
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

export const importAssemblyMaterials = async (
  data: MaterialImportData[]
): Promise<{ created: number; updated: number }> => {
  try {
    const response = await axios.post<{ created: number; updated: number }>(
      `${API_BASE}/material/assembly/import`,
      { materials: data },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('❌ 조립 자재 업로드 실패:', error);
    throw error;
  }
};

export const deleteAssemblyHistories = async (ids: number[]): Promise<void> => {
  await axios.delete(`${API_BASE}/material/history/assembly`, {
    data: { ids },
    withCredentials: true,
  });
};

export const deleteAllAssemblyHistories = async (): Promise<void> => {
  await axios.delete(`${API_BASE}/material/history/assembly/all`, {
    withCredentials: true,
  });
};

/** 조립 자재 엑셀 다운로드 */
export const downloadAssemblyExcel = async (): Promise<void> => {
  const res = await axios.get(`${API_BASE}/material/assembly/export`, {
    withCredentials: true,
    responseType: 'blob',
  });

  // 파일명 추출 (Content-Disposition 헤더에서)
  const contentDisposition = res.headers['content-disposition'];
  let filename = '조립_원자재_관리대장.xlsx';
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
