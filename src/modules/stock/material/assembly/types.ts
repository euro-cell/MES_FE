export interface AssemblyMaterial {
  id: number;
  process: string; // 조립
  category: string; // 자재 분류 (중분류)
  type: string; // 자재 종류 (소분류)
  purpose: string; // 용도
  name: string; // 제품명
  spec?: string; // 스펙
  lotNo?: string; // Lot No.
  company?: string; // 제조/공급처
  origin: string; // 국내/해외
  unit: string; // 단위
  price?: number; // 가격
  note?: string; // 비고
  stock?: number; // 재고
  hasCoa: boolean; // CoA 등록 여부 (조회 전용)
}

/** 자재 등록/수정 요청 본문. hasCoa는 조회 전용 파생 필드라 제외한다. */
export type AssemblyMaterialInput = Omit<AssemblyMaterial, 'id' | 'hasCoa'>;

export interface MaterialHistory {
  id: number;
  materialId: number;
  type: string; // 입고, 출고, 사용
  previousStock: number;
  currentStock: number;
  createdAt: string;
  material: {
    name: string;
    lotNo?: string;
  };
}
