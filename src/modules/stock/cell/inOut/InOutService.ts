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
