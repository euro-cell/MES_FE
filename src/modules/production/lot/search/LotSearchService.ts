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
    // API 없을 경우 목데이터 반환
    return getMockSearchResult();
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
      { category: 'Cathode', material: 'NCM622', product: 'NCM-622', manufacturer: 'POSCO', lot: 'NCM-2412-001' },
      { category: 'Cathode', material: 'LCO', product: '15DP', manufacturer: 'EASPRING', lot: 'LCO-2412-001' },
      { category: 'Cathode', material: 'Conductor', product: 'Super-P', manufacturer: 'Imerys_KB코퍼레이션', lot: 'CD-2412-001' },
      { category: 'Cathode', material: 'Binder', product: 'Solef5130', manufacturer: 'Solvay_Typolymer', lot: 'BD-2412-001' },
      { category: 'Cathode', material: 'Collector', product: 'Al-Foil (230×10)', manufacturer: '삼아알미늄', lot: 'CL-2412-001' },
      { category: 'Cathode', material: 'Solvent', product: 'NMP', manufacturer: '재원산업', lot: 'SV-2412-001' },
      // Anode
      { category: 'Anode', material: 'LTO', product: 'KP-T2', manufacturer: 'KEDA', lot: 'LTO-2412-001' },
      { category: 'Anode', material: 'Conductor', product: 'Super-P', manufacturer: 'Imerys_KB코퍼레이션', lot: 'CD-2412-002' },
      { category: 'Anode', material: 'Binder', product: 'Solef5130', manufacturer: 'Solvay_Typolymer', lot: 'BD-2412-002' },
      { category: 'Anode', material: 'Collector', product: 'Al-Foil (230×10)', manufacturer: '삼아알미늄', lot: 'CL-2412-002' },
      { category: 'Anode', material: 'Solvent', product: 'NMP', manufacturer: '재원산업', lot: 'SV-2412-002' },
      // Ass'y
      { category: "Ass'y", material: 'separator', product: 'MS-PCS12_182mm', manufacturer: '에너에버', lot: 'SP-2412-001' },
      { category: "Ass'y", material: 'Tab', product: '25mm, 0.3T', manufacturer: '신화아이티', lot: 'TB-2412-001' },
      { category: "Ass'y", material: 'Pouch', product: 'CP-153A', manufacturer: '디아인텍', lot: 'PC-2412-001' },
      { category: "Ass'y", material: 'electrolyte', product: 'SL24-2828', manufacturer: '동화일렉', lot: 'EL-2412-001' },
      { category: "Ass'y", material: 'PI Tape', product: 'ST-5399_15mm', manufacturer: '대현에스티', lot: 'PI-2412-001' },
      { category: "Ass'y", material: 'PP Tape', product: 'ST-PP5055DGHF_15', manufacturer: '대현에스티', lot: 'PP-2412-001' },
    ],
  };
}
