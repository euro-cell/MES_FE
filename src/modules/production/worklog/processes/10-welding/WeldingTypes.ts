export interface WeldingWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // A. 자재 투입 정보
  leadTabLot?: string;
  leadTabManufacturer?: string;
  leadTabSpec?: string;
  leadTabUsage?: number;
  piTapeLot?: string;
  piTapeManufacturer?: string;
  piTapeSpec?: string;
  piTapeUsage?: number;

  // B. 생산 정보 - 프리웰딩
  preWeldingJrNumber?: string;
  preWeldingWorkQuantity?: number;
  preWeldingGoodQuantity?: number;
  preWeldingDefectQuantity?: number;
  preWeldingDefectRemark?: string;

  // B. 생산 정보 - 메인웰딩
  mainWeldingJrNumber?: string;
  mainWeldingWorkQuantity?: number;
  mainWeldingGoodQuantity?: number;
  mainWeldingDefectQuantity?: number;
  mainWeldingDefectRemark?: string;

  // B. 생산 정보 - 하이팟2
  hipot2JrNumber?: string;
  hipot2WorkQuantity?: number;
  hipot2GoodQuantity?: number;
  hipot2DefectQuantity?: number;

  // B. 생산 정보 - 테이핑
  tapingJrNumber?: string;
  tapingWorkQuantity?: number;
  tapingGoodQuantity?: number;
  tapingDefectQuantity?: number;

  // C. 공정 조건 - 프리웰딩
  preWeldingEnergy?: number;
  preWeldingAmplitude?: number;
  preWeldingStopper?: number;
  preWeldingPressure?: number;
  preWeldingHoldTime?: number;

  // C. 공정 조건 - 메인웰딩
  mainWeldingEnergy?: number;
  mainWeldingAmplitude?: number;
  mainWeldingStopper?: number;
  mainWeldingPressure?: number;
  mainWeldingHoldTime?: number;

  // C. 공정 조건 - 하이팟
  hipotVoltage?: number;
  hipotTime?: number;

  // C. 공정 조건 - 테이핑
  tapingLength?: number;
}

export interface WeldingWorklogPayload {
  workDate: string;
  round: number;

  // A. 자재 투입 정보
  leadTabLot?: string;
  leadTabManufacturer?: string;
  leadTabSpec?: string;
  leadTabUsage?: number;
  piTapeLot?: string;
  piTapeManufacturer?: string;
  piTapeSpec?: string;
  piTapeUsage?: number;

  // B. 생산 정보 - 프리웰딩
  preWeldingJrNumber?: string;
  preWeldingWorkQuantity?: number;
  preWeldingGoodQuantity?: number;
  preWeldingDefectQuantity?: number;
  preWeldingDefectRemark?: string;

  // B. 생산 정보 - 메인웰딩
  mainWeldingJrNumber?: string;
  mainWeldingWorkQuantity?: number;
  mainWeldingGoodQuantity?: number;
  mainWeldingDefectQuantity?: number;
  mainWeldingDefectRemark?: string;

  // B. 생산 정보 - 하이팟2
  hipot2JrNumber?: string;
  hipot2WorkQuantity?: number;
  hipot2GoodQuantity?: number;
  hipot2DefectQuantity?: number;

  // B. 생산 정보 - 테이핑
  tapingJrNumber?: string;
  tapingWorkQuantity?: number;
  tapingGoodQuantity?: number;
  tapingDefectQuantity?: number;

  // C. 공정 조건 - 프리웰딩
  preWeldingEnergy?: number;
  preWeldingAmplitude?: number;
  preWeldingStopper?: number;
  preWeldingPressure?: number;
  preWeldingHoldTime?: number;

  // C. 공정 조건 - 메인웰딩
  mainWeldingEnergy?: number;
  mainWeldingAmplitude?: number;
  mainWeldingStopper?: number;
  mainWeldingPressure?: number;
  mainWeldingHoldTime?: number;

  // C. 공정 조건 - 하이팟
  hipotVoltage?: number;
  hipotTime?: number;

  // C. 공정 조건 - 테이핑
  tapingLength?: number;
}
