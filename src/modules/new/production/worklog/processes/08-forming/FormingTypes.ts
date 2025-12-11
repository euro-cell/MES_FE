// Forming 작업일지 타입 정의

export interface FormingWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // ===== A. 자재 투입 정보 (Material Input) =====
  pouchLot?: string;
  pouchManufacturer?: string;
  pouchSpec?: string;
  pouchUsage?: number;

  // ===== B. 생산 정보 (Production Info) =====
  // 컷팅
  cuttingWorkQuantity?: number;
  cuttingGoodQuantity?: number;
  cuttingDefectQuantity?: number;
  cuttingDiscardQuantity?: number;
  cuttingDefectRate?: number;

  // 포밍
  formingWorkQuantity?: number;
  formingGoodQuantity?: number;
  formingDefectQuantity?: number;
  formingDiscardQuantity?: number;
  formingDefectRate?: number;

  // 폴딩
  foldingWorkQuantity?: number;
  foldingGoodQuantity?: number;
  foldingDefectQuantity?: number;
  foldingDiscardQuantity?: number;
  foldingDefectRate?: number;

  // 탑컷팅
  topCuttingWorkQuantity?: number;
  topCuttingGoodQuantity?: number;
  topCuttingDefectQuantity?: number;
  topCuttingDiscardQuantity?: number;
  topCuttingDefectRate?: number;

  // ===== C. 공정 조건 (Process Conditions) =====
  // 컷팅
  cuttingLength?: number;
  cuttingChecklist?: string;

  // 포밍
  formingDepth?: number;
  formingStopperHeight?: number;
  formingChecklist?: string;

  // 탑컷팅
  topCuttingLength?: number;
  topCuttingChecklist?: string;
}

export interface FormingWorklogPayload {
  workDate: string;
  round: number;

  // ===== A. 자재 투입 정보 =====
  pouchLot?: string;
  pouchManufacturer?: string;
  pouchSpec?: string;
  pouchUsage?: number;

  // ===== B. 생산 정보 =====
  // 컷팅
  cuttingWorkQuantity?: number;
  cuttingGoodQuantity?: number;
  cuttingDefectQuantity?: number;
  cuttingDiscardQuantity?: number;
  cuttingDefectRate?: number;

  // 포밍
  formingWorkQuantity?: number;
  formingGoodQuantity?: number;
  formingDefectQuantity?: number;
  formingDiscardQuantity?: number;
  formingDefectRate?: number;

  // 폴딩
  foldingWorkQuantity?: number;
  foldingGoodQuantity?: number;
  foldingDefectQuantity?: number;
  foldingDiscardQuantity?: number;
  foldingDefectRate?: number;

  // 탑컷팅
  topCuttingWorkQuantity?: number;
  topCuttingGoodQuantity?: number;
  topCuttingDefectQuantity?: number;
  topCuttingDiscardQuantity?: number;
  topCuttingDefectRate?: number;

  // ===== C. 공정 조건 =====
  // 컷팅
  cuttingLength?: number;
  cuttingChecklist?: string;

  // 포밍
  formingDepth?: number;
  formingStopperHeight?: number;
  formingChecklist?: string;

  // 탑컷팅
  topCuttingLength?: number;
  topCuttingChecklist?: string;
}
