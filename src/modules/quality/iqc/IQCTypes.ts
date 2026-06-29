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
  | 'ConductiveAdditive'
  | 'ConductiveAdditive2'
  | 'CurrentCollector'
  | 'Separator'
  | 'Electrolyte'
  | 'Pouch'
  | 'LeadTab';

/** IQC category → menu 매핑 */
export const CATEGORY_MAP: Record<string, IQCMenuType> = {
  '양극재': 'CathodeMaterial1',
  '음극재': 'AnodeMaterial',
  '도전재': 'ConductiveAdditive',
  '도전재2': 'ConductiveAdditive2',
  '집전체': 'CurrentCollector',
  '분리막': 'Separator',
  '전해액': 'Electrolyte',
  '파우치': 'Pouch',
  '리드탭': 'LeadTab',
};

/** IQC 검사 결과 항목 */
export interface IQCResult {
  id?: number;
  category: string;       // 검사 항목 (입도, 수분, 탭밀도, pH, Half cell 등)
  item?: string;          // 세부 항목 (D5, D50, D95, 0.1C 등)
  unit?: string;
  spec?: string;          // 규격
  refCoa?: string;        // Reference - CoA
  refLastData?: number | string; // Reference - Last data
  sample1?: number | string;
  sample2?: number | string;
  sample3?: number | string;
  average?: number | string;  // 서버 자동 계산
  isPassed: boolean | null;
  note?: string;          // 비고
}

/** IQC CoA 참조 결과 */
export interface IQCCoaRef {
  id?: number;
  attrName: string;       // 속성명 (BET(㎡/g) 등)
  attrValue?: string;     // 속성값
}

/** IQC 이미지 */
export interface IQCImage {
  id?: number;
  imageType: string;      // PSD, Half cell, FE-SEM 등
  imageLabel?: string;    // 사용자가 입력한 표시용 레이블
  filePath?: string;
  fileUrl?: string;
}

/** IQC 첨부 파일 (PDF 등) */
export interface IQCFile {
  id?: number;
  fileType: string;       // PSD_DOC 등
  fileName: string;       // 원본 파일명
  filePath?: string;
}

/** PSD raw data 항목 */
export interface IQCPsdData {
  size: number;
  volumeIn: number;
}

/** IQC 단건 (목록 및 상세 공통) */
export interface IQCItem {
  id: number;
  category: string;       // 양극재, 음극재 등
  type: string;           // NCM622 등 품목
  name: string;           // 품명
  manufacturer?: string;
  lotNo?: string;
  usage?: string;
  receiptDate?: string;
  inspectionDate?: string;
  inspector?: string;
  isPassed?: boolean;
  remark?: string;
  psdData?: IQCPsdData[];
  results?: IQCResult[];
  coaRefs?: IQCCoaRef[];
  images?: IQCImage[];
  files?: IQCFile[];
}

/** IQC 생성/수정 요청 바디 */
export type IQCItemRequest = Omit<IQCItem, 'id' | 'isPassed'>;
