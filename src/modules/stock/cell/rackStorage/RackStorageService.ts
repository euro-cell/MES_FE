import axios from 'axios';
import type { RackLocation, RackStorageData } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface StorageUsageResponse {
  [key: string]: {
    count: number;
    capacity: number;
    usage: number;
  };
}

export const fetchRackStorageData = async (): Promise<RackStorageData> => {
  try {
    const res = await axios.get<StorageUsageResponse>(`${API_BASE}/cell-inventory/storage-usage`, {
      withCredentials: true,
    });

    const locations: RackLocation[] = Object.entries(res.data).map(([key, data]) => {
      const [letter, number] = key.split('-');
      return {
        key,
        letter,
        number: parseInt(number),
        count: data.count,
        capacity: data.capacity,
        usage: data.usage,
      };
    });

    return {
      locations: locations.sort((a, b) => {
        const letterCompare = a.letter.localeCompare(b.letter);
        return letterCompare !== 0 ? letterCompare : a.number - b.number;
      }),
      updatedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('❌ RACK 보관 현황 조회 실패:', err);
    throw err.response?.data || err;
  }
};
