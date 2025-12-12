export interface SealingWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // A. 자재 투입 정보
  pouchLot?: string;
  pouchManufacturer?: string;
  pouchDepth?: number;
  pouchInputQuantity?: number;
  pouchUsage?: number;

  // B. 생산 정보 - 탑
  topJrNumber?: string;
  topWorkQuantity?: number;
  topGoodQuantity?: number;
  topDefectQuantity?: number;
  topDiscardQuantity?: number;
  topDefectRate?: number;

  // B. 생산 정보 - 사이드
  sideJrNumber?: string;
  sideWorkQuantity?: number;
  sideGoodQuantity?: number;
  sideDefectQuantity?: number;
  sideDiscardQuantity?: number;
  sideDefectRate?: number;

  // B. 생산 정보 - 하이팟3
  hipot3JrNumber?: string;
  hipot3WorkQuantity?: number;
  hipot3GoodQuantity?: number;
  hipot3DefectQuantity?: number;
  hipot3DiscardQuantity?: number;
  hipot3DefectRate?: number;

  // C. 공정 조건 - 탑
  topTemperature?: string;
  topPressure?: string;
  topSealingTime?: number;
  topChecklist?: string;

  // C. 공정 조건 - 사이드
  sideTemperature?: string;
  sidePressure?: string;
  sideSealingTime?: number;
  sideChecklist?: string;

  // C. 공정 조건 - 바텀
  bottomTemperature?: string;
  bottomPressure?: string;
  bottomSealingTime?: number;
  bottomChecklist?: string;

  // C. 공정 조건 - 하이팟
  hipotVoltage?: number;
  hipotTime?: number;
}

export interface SealingWorklogPayload {
  workDate: string;
  round: number;

  // A. 자재 투입 정보
  pouchLot?: string;
  pouchManufacturer?: string;
  pouchDepth?: number;
  pouchInputQuantity?: number;
  pouchUsage?: number;

  // B. 생산 정보 - 탑
  topJrNumber?: string;
  topWorkQuantity?: number;
  topGoodQuantity?: number;
  topDefectQuantity?: number;
  topDiscardQuantity?: number;
  topDefectRate?: number;

  // B. 생산 정보 - 사이드
  sideJrNumber?: string;
  sideWorkQuantity?: number;
  sideGoodQuantity?: number;
  sideDefectQuantity?: number;
  sideDiscardQuantity?: number;
  sideDefectRate?: number;

  // B. 생산 정보 - 하이팟3
  hipot3JrNumber?: string;
  hipot3WorkQuantity?: number;
  hipot3GoodQuantity?: number;
  hipot3DefectQuantity?: number;
  hipot3DiscardQuantity?: number;
  hipot3DefectRate?: number;

  // C. 공정 조건 - 탑
  topTemperature?: string;
  topPressure?: string;
  topSealingTime?: number;
  topChecklist?: string;

  // C. 공정 조건 - 사이드
  sideTemperature?: string;
  sidePressure?: string;
  sideSealingTime?: number;
  sideChecklist?: string;

  // C. 공정 조건 - 바텀
  bottomTemperature?: string;
  bottomPressure?: string;
  bottomSealingTime?: number;
  bottomChecklist?: string;

  // C. 공정 조건 - 하이팟
  hipotVoltage?: number;
  hipotTime?: number;
}
