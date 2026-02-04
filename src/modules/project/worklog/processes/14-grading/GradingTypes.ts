export interface GradingWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  line?: string;
  plant?: string;

  // A. 자재 투입 정보
  productionId?: string;
  cellNumberRange?: string;

  // B. 생산 정보 - OCV2
  ocv2InputQuantity?: number;
  ocv2GoodQuantity?: number;
  ocv2DefectQuantity?: number;
  ocv2DiscardQuantity?: number;
  ocv2DefectRate?: number;

  // B. 생산 정보 - IR
  irInputQuantity?: number;
  irGoodQuantity?: number;
  irDefectQuantity?: number;
  irDiscardQuantity?: number;
  irDefectRate?: number;

  // B. 생산 정보 - HiPot
  hipotInputQuantity?: number;
  hipotGoodQuantity?: number;
  hipotDefectQuantity?: number;
  hipotDiscardQuantity?: number;
  hipotDefectRate?: number;

  // B. 생산 정보 - Grading
  gradingInputQuantity?: number;
  gradingGoodQuantity?: number;
  gradingDefectQuantity?: number;
  gradingDiscardQuantity?: number;
  gradingDefectRate?: number;
  grading1CellNumberRange?: string;
  grading2CellNumberRange?: string;
  grading3CellNumberRange?: string;
  grading4CellNumberRange?: string;
  grading5CellNumberRange?: string;
  grading1Quantity?: number;
  grading2Quantity?: number;
  grading3Quantity?: number;
  grading4Quantity?: number;
  grading5Quantity?: number;

  // B. 생산 정보 - Lot 범위
  lotRange?: string;

  // C. 공정 조건 - Grading
  gradingVoltageCondition?: string;
  gradingLowerVoltage?: number;
  gradingUpperVoltage?: number;
  gradingAppliedCurrent?: number;
  gradingTemperature?: number;

  // C. 공정 조건 - OCV2
  ocv2MeasurementEquipmentName?: string;
  ocv2VoltageSpec?: string;

  // C. 공정 조건 - OCV3
  ocv3MeasurementEquipmentName?: string;
  ocv3VoltageSpec?: string;

  // D. 비고
  remark?: string;
}

export interface GradingWorklogPayload {
  projectId: number;
  processId?: string;
  workDate?: string;
  round?: number;
  writer?: string;
  line?: string;
  plant?: any;

  // A. 자재 투입 정보
  productionId?: string;
  cellNumberRange?: string;

  // B. 생산 정보 - OCV2
  ocv2InputQuantity?: number;
  ocv2GoodQuantity?: number;
  ocv2DefectQuantity?: number;
  ocv2DiscardQuantity?: number;
  ocv2DefectRate?: number;

  // B. 생산 정보 - IR
  irInputQuantity?: number;
  irGoodQuantity?: number;
  irDefectQuantity?: number;
  irDiscardQuantity?: number;
  irDefectRate?: number;

  // B. 생산 정보 - HiPot
  hipotInputQuantity?: number;
  hipotGoodQuantity?: number;
  hipotDefectQuantity?: number;
  hipotDiscardQuantity?: number;
  hipotDefectRate?: number;

  // B. 생산 정보 - Grading
  gradingInputQuantity?: number;
  gradingGoodQuantity?: number;
  gradingDefectQuantity?: number;
  gradingDiscardQuantity?: number;
  gradingDefectRate?: number;
  grading1CellNumberRange?: string;
  grading2CellNumberRange?: string;
  grading3CellNumberRange?: string;
  grading4CellNumberRange?: string;
  grading5CellNumberRange?: string;
  grading1Quantity?: number;
  grading2Quantity?: number;
  grading3Quantity?: number;
  grading4Quantity?: number;
  grading5Quantity?: number;

  // B. 생산 정보 - Lot 범위
  lotRange?: string;

  // C. 공정 조건 - Grading
  gradingVoltageCondition?: string;
  gradingLowerVoltage?: number;
  gradingUpperVoltage?: number;
  gradingAppliedCurrent?: number;
  gradingTemperature?: number;

  // C. 공정 조건 - OCV2
  ocv2MeasurementEquipmentName?: string;
  ocv2VoltageSpec?: string;

  // C. 공정 조건 - OCV3
  ocv3MeasurementEquipmentName?: string;
  ocv3VoltageSpec?: string;

  // D. 비고
  remark?: string;
}
