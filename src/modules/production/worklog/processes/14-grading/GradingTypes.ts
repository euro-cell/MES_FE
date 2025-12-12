export interface GradingWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

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

  // B. 생산 정보 - Lot 범위
  lotRange?: string;

  // C. 공정 조건 - OCV2
  ocv2VoltageSpec?: string;
  ocv2MeasurementTemp?: number;
  ocv2SettlingTime?: number;

  // C. 공정 조건 - IR
  irResistanceSpec?: string;
  irMeasurementFreq?: number;
  irMeasurementTemp?: number;

  // C. 공정 조건 - HiPot
  hipotVoltageSpec?: string;
  hipotTestTime?: number;
  hipotLeakageCurrent?: number;

  // C. 공정 조건 - Grading
  gradingCapacitySpec?: string;
  gradingVoltageRange?: string;
  gradingClassification?: string;

  // D. 비고
  remark?: string;
}

export interface GradingWorklogPayload {
  projectId: number;
  processId?: string;
  workDate?: string;
  round?: number;
  writer?: string;

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

  // B. 생산 정보 - Lot 범위
  lotRange?: string;

  // C. 공정 조건 - OCV2
  ocv2VoltageSpec?: string;
  ocv2MeasurementTemp?: number;
  ocv2SettlingTime?: number;

  // C. 공정 조건 - IR
  irResistanceSpec?: string;
  irMeasurementFreq?: number;
  irMeasurementTemp?: number;

  // C. 공정 조건 - HiPot
  hipotVoltageSpec?: string;
  hipotTestTime?: number;
  hipotLeakageCurrent?: number;

  // C. 공정 조건 - Grading
  gradingCapacitySpec?: string;
  gradingVoltageRange?: string;
  gradingClassification?: string;

  // D. 비고
  remark?: string;
}
