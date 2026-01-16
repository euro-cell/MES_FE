import axios from 'axios';
import type { CellInventoryRequest, CellInventoryResponse, CellInventoryStatisticsResponse, StorageUsageResponse } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const createCellInventory = async (payload: CellInventoryRequest): Promise<CellInventoryResponse> => {
  console.log('🚀 ~ payload:', payload);
  try {
    const res = await axios.post<CellInventoryResponse>(`${API_BASE}/cell-inventory`, payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    console.error('❌ 등록실패:', err);
    throw err.response?.data || err;
  }
};

export const updateCellInventoryOut = async (payload: CellInventoryRequest): Promise<CellInventoryResponse> => {
  console.log('🚀 ~ payload:', payload);
  try {
    const res = await axios.patch<CellInventoryResponse>(`${API_BASE}/cell-inventory`, payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    console.error('❌ 출고 실패:', err);
    throw err.response?.data || err;
  }
};

export const updateCellInventoryRestock = async (payload: CellInventoryRequest): Promise<CellInventoryResponse> => {
  console.log('🚀 ~ payload:', payload);
  try {
    const res = await axios.patch<CellInventoryResponse>(`${API_BASE}/cell-inventory/restock`, payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    console.error('❌ 재입고 실패:', err);
    throw err.response?.data || err;
  }
};

export const fetchCellInventoryStatistics = async (): Promise<CellInventoryStatisticsResponse> => {
  try {
    const res = await axios.get<CellInventoryStatisticsResponse>(`${API_BASE}/cell-inventory/statistics`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    console.error('❌ 통계 조회 실패:', err);
    throw err.response?.data || err;
  }
};

export const fetchStorageUsage = async (): Promise<StorageUsageResponse> => {
  try {
    const res = await axios.get<StorageUsageResponse>(`${API_BASE}/cell-inventory/storage-usage`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    console.error('❌ 보관 위치 현황 조회 실패:', err);
    throw err.response?.data || err;
  }
};

/** 셀 관리 엑셀 다운로드 (입/출고, NCR, 프로젝트별 - 3개 시트) */
export const downloadCellExcel = async (): Promise<void> => {
  const res = await axios.get(`${API_BASE}/cell-inventory/export`, {
    withCredentials: true,
    responseType: 'blob',
  });

  // 파일명 추출 (Content-Disposition 헤더에서)
  const contentDisposition = res.headers['content-disposition'];
  let filename = '셀 보관 현황.xlsx';
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
