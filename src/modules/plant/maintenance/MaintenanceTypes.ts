export interface MaintenanceRecord {
  id: number;
  equipmentId: number;       // 설비 ID (FK)

  // 설비 정보 (조회 시 조인)
  assetNo?: string;          // 자산번호
  equipmentNo?: string;      // 설비번호
  equipmentName?: string;    // 설비명

  // 유지보수 정보
  inspectionDate: string;    // 점검일자
  replacementHistory: string; // 교체 이력
  usedParts: string;         // 사용 부품
  maintainer: string;        // 보수자
  verifier: string;          // 확인자
  remark?: string;           // 비고
}

export type MaintenancePayload = Omit<MaintenanceRecord, 'id' | 'assetNo' | 'equipmentNo' | 'equipmentName'>;
