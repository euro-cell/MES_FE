export type EquipmentCategory = '생산' | '개발' | '측정';

export type EquipmentProcess = '전극' | '조립' | '화성';

export interface Equipment {
  id: number;
  category: EquipmentCategory;
  processType?: EquipmentProcess; // 공정 (전극/조립/화성)

  // 공통 필드
  assetNo: string;           // 자산번호
  equipmentNo: string;       // 설비번호
  name: string;              // 설비명
  manufacturer: string;      // 제조사
  purchaseDate: string;      // 구입일자
  grade: string;             // 설비등급
  maintenanceMethod: string; // 보전방법
  remark?: string;           // 비고

  // 측정 전용 필드
  deviceNo?: string;           // 기기번호
  calibrationDate?: string;    // 교정일
  nextCalibrationDate?: string; // 차기 교정일
  calibrationAgency?: string;  // 검교정 기관
}

/**
 * 설비 관리 대장 목록(GET /equipment)의 응답 항목.
 * hasManual은 서버가 계산해 내려주는 조회 전용 필드로,
 * mixers/lines 조회에는 포함되지 않는다.
 */
export type EquipmentListItem = Equipment & {
  hasManual: boolean; // 매뉴얼 등록 여부
};

export type EquipmentPayload = Omit<Equipment, 'id'>;
