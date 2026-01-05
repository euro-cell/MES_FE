export interface ElectrodeMaterial {
  id: number;
  process: string; // 전극
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
}
