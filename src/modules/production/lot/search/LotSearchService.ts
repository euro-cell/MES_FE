import axios from 'axios';
import type { LotSearchResult } from './LotSearchTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// 셀 Lot으로 통합 검색 (백엔드 API 호출)
export async function searchLot(cellLotNumber: string): Promise<LotSearchResult | null> {
  try {
    // TODO: 백엔드 API 연동 시 아래 코드 사용
    const response = await axios.get(`${API_BASE}/production/lot/search`, {
      params: { lot: cellLotNumber },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Lot 검색 실패:', error);
    return null;
  }
}

// 목데이터
function getMockSearchResult(): LotSearchResult {
  return {
    projectId: 1,
    projectName: 'NA-E-2412-1-TNP38',
    processLots: [
      { category: 'Mixing', cathodeLot: 'MX-CA-2412-001', anodeLot: 'MX-AN-2412-001' },
      { category: 'Coating', cathodeLot: 'CT-CA-2412-001', anodeLot: 'CT-AN-2412-001' },
      { category: 'Calendering', cathodeLot: 'CL-CA-2412-001', anodeLot: 'CL-AN-2412-001' },
      { category: 'Slitting', cathodeLot: 'SL-CA-2412-001', anodeLot: 'SL-AN-2412-001' },
      { category: 'Notching', cathodeLot: 'NC-CA-2412-001', anodeLot: 'NC-AN-2412-001' },
      { category: 'Assembly', lot: 'AS-2412-001' },
      { category: 'Formation', lot: 'FM-2412-001' },
    ],
    rawMaterialLots: [
      // Cathode
      { category: 'Cathode', material: '양극재', product: 'LCO', spec: '15DP', manufacturer: 'EASPRING', lot: 'ZBGSL-15DP-22091602' },
      { category: 'Cathode', material: '도전재', product: 'Carbon black', spec: 'Super-P-Li', manufacturer: 'IMERYS(케이비코퍼레이션)', lot: '841D0212' },
      { category: 'Cathode', material: '도전재', product: 'CNT', spec: 'CN-04Y', manufacturer: '나노신소재', lot: 'ANP-221219' },
      { category: 'Cathode', material: '집전체', product: 'Al Foil', spec: 'A1100 H18(12㎛ x 230㎜)', manufacturer: '롯데인프라셀', lot: 'C2E4100006-21' },
      // Anode
      { category: 'Anode', material: '집전체', product: 'Al Foil', spec: 'A1100 H18(12㎛ x 230㎜)', manufacturer: '롯데인프라셀', lot: 'C2E4100006-21' },
      // Ass'y
      { category: "Ass'y", material: '분리막', product: '양면', spec: 'GPCS13E9E22D', manufacturer: 'Enerever', lot: 'E13S2250910A01' },
      { category: "Ass'y", material: '리드탭', product: 'Al lead tab', spec: 'Al lead tab', manufacturer: '신화아이티', lot: '230816MA' },
      { category: "Ass'y", material: '테이프', product: 'PI(Yellow)', spec: 'ST-5399WA', manufacturer: '대현에스티', lot: '22702F9-14' },
      { category: "Ass'y", material: '파우치', product: 'CPP', spec: 'CP-153A', manufacturer: '디아인텍', lot: 'A4F130101' },
      { category: "Ass'y", material: '전해액', product: 'LiPF6', spec: 'ED-UFC-026A1', manufacturer: '동화일렉트로라이트', lot: 'SL25-0819' },
    ],
  };
}
