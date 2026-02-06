export interface IQCProject {
  id: number;
  name: string;
}

/** IQC 메뉴 타입 */
export type IQCMenuType =
  | 'Summary'
  | 'CathodeMaterial1'
  | 'CathodeMaterial2'
  | 'AnodeMaterial'
  | 'ConductiveMaterial'
  | 'CurrentCollector'
  | 'Separator'
  | 'Electrolyte'
  | 'Pouch'
  | 'LeadTab';

/** Summary 데이터 */
export interface IQCSummary {
  projectOverview: string;
  nonConformity: {
    cathodeMaterial: number;
    anodeMaterial: number;
    conductiveMaterial: number;
    currentCollector: number;
    separator: number;
    electrolyte: number;
    pouch: number;
    leadTab: number;
  };
  remarks: string;
  iqcList: IQCListItem[];
}

export interface IQCListItem {
  no: number;
  category: string;
  standard: string;
  result: string;
  inspector: string;
  date: string;
}

/** 양극재1 (NCM622) */
export interface CathodeMaterial1Data {
  id: number;
  // 기본 정보
  productCode: string; // 품목
  productName: string; // 품명
  manufacturer: string; // 제조원
  lotNo: string; // Lot no.
  usage: string; // 사용처
  receiveDate: string; // 입고일
  inspectionDate: string; // 검사일
  inspector: string; // 검사자
  // 검사 결과
  inspectionResults: CathodeMaterial1Result[];
  // 기타 CoA 참조 결과
  coaResults: CathodeMaterial1CoaResult;
  // 이미지
  images: {
    psd?: string;
    halfCell?: string;
    feSem?: string;
  };
  // 비고
  remarks: string;
}

export interface CathodeMaterial1Result {
  item: string;
  subItem?: string; // 세부 항목 (D5, D50, D95, 0.1C 등)
  unit: string; // 단위
  standard: string; // 규격
  refCoa: string; // Reference - CoA
  refLastData: string; // Reference - Last data
  sample1: string; // 검사 결과 - 샘플1
  sample2: string; // 검사 결과 - 샘플2
  sample3: string; // 검사 결과 - 샘플3
  average: string; // 검사 결과 - 평균
  pass: boolean | null; // 합불판정 (합/불/null)
  remarks: string; // 비고
}

export interface CathodeMaterial1CoaResult {
  dMin: string; // Dmin(μm)
  dMax: string; // Dmax(μm)
  bet: string; // BET(m²/g)
  lioh: string; // LiOH(%)
  li2co3: string; // Li2CO3(%)
  fe: string; // Fe(ppm)
}

/** 양극재2 (LCO) */
export interface CathodeMaterial2Data {
  id: number;
  inspectionDate: string;
  lot: string;
  manufacturer: string;
  inspectionResults: CathodeMaterial2Result[];
  coaReference: string;
  images: string[];
  remarks: string;
}

export interface CathodeMaterial2Result {
  item: string;
  standard: string;
  result: string;
  pass: boolean;
}

/** 음극재 (LTO) */
export interface AnodeMaterialData {
  id: number;
  inspectionDate: string;
  lot: string;
  manufacturer: string;
  inspectionResults: AnodeMaterialResult[];
  psdRawData: string;
  coaReference: string;
  images: string[];
  remarks: string;
}

export interface AnodeMaterialResult {
  item: string;
  standard: string;
  result: string;
  pass: boolean;
}

/** 도전재 (Carbon black) */
export interface ConductiveMaterialData {
  id: number;
  inspectionDate: string;
  lot: string;
  manufacturer: string;
  inspectionResults: ConductiveMaterialResult[];
  coaReference: string;
  remarks: string;
}

export interface ConductiveMaterialResult {
  item: string;
  standard: string;
  result: string;
  pass: boolean;
}

/** 집전체 (Al-foil) */
export interface CurrentCollectorData {
  id: number;
  inspectionDate: string;
  lot: string;
  manufacturer: string;
  inspectionResults: CurrentCollectorResult[];
  coaReference: string;
  remarks: string;
}

export interface CurrentCollectorResult {
  item: string;
  standard: string;
  result: string;
  pass: boolean;
}

/** 분리막 */
export interface SeparatorData {
  id: number;
  inspectionDate: string;
  lot: string;
  manufacturer: string;
  inspectionResults: SeparatorResult[];
  coaReference: string;
  remarks: string;
}

export interface SeparatorResult {
  item: string;
  standard: string;
  result: string;
  pass: boolean;
}

/** 전해액 */
export interface ElectrolyteData {
  id: number;
  inspectionDate: string;
  lot: string;
  manufacturer: string;
  inspectionResults: ElectrolyteResult[];
  coaReference: string;
  remarks: string;
}

export interface ElectrolyteResult {
  item: string;
  standard: string;
  result: string;
  pass: boolean;
}

/** 파우치 (Al-Pouch) */
export interface PouchData {
  id: number;
  inspectionDate: string;
  lot: string;
  manufacturer: string;
  inspectionResults: PouchResult[];
  coaReference: string;
  remarks: string;
}

export interface PouchResult {
  item: string;
  standard: string;
  result: string;
  pass: boolean;
}

/** 리드탭 (Al-Tab) */
export interface LeadTabData {
  id: number;
  inspectionDate: string;
  lot: string;
  manufacturer: string;
  inspectionResults: LeadTabResult[];
  coaReference: string;
  diagramImage: string;
  remarks: string;
}

export interface LeadTabResult {
  item: string;
  standard: string;
  result: string;
  pass: boolean;
}
