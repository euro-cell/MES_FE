// 공정 Lot 검색 결과
export interface LotSearchResult {
  projectId: number;
  projectName: string;
  processLots: ProcessLotInfo[];
  rawMaterialLots: RawMaterialLotInfo[];
}

// 공정 Lot 정보
export interface ProcessLotInfo {
  category: string;  // Mixing, Coating, Calendering, Notching, Assembly, Formation
  cathodeLot?: string | null;  // 전극공정용
  anodeLot?: string | null;    // 전극공정용
  lot?: string | null;         // 조립/화성 공정용
}

// 원자재 Lot 정보
export interface RawMaterialLotInfo {
  category: 'Cathode' | 'Anode' | "Ass'y";
  material: string;
  product: string;
  spec: string | null;
  manufacturer: string | null;
  lot: string;
}

// 공정 카테고리 정의
export const PROCESS_CATEGORIES: Record<string, string[]> = {
  전극공정: ['Mixing', 'Coating', 'Calendering', 'Slitting', 'Notching'],
  '조립 공정': ['Assembly'],
  '화성 공정': ['Formation'],
};

// 원자재 카테고리별 자재 목록
export const RAW_MATERIAL_CATEGORIES: Record<string, string[]> = {
  Cathode: ['NCM622', 'LCO', 'Conductor', 'Binder', 'Collector', 'Solvent'],
  Anode: ['LTO', 'Conductor', 'Binder', 'Collector', 'Solvent'],
  "Ass'y": ['separator', 'Tab', 'Pouch', 'electrolyte', 'PI Tape', 'PP Tape'],
};
