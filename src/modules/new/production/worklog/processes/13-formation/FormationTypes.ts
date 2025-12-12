export interface FormationWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // A. 자재 투입 정보
  cellNumberRange?: string;

  // B. 생산 정보 - 디가스1
  degas1InputQuantity?: number;
  degas1GoodQuantity?: number;
  degas1DefectQuantity?: number;
  degas1DiscardQuantity?: number;
  degas1DefectRate?: number;

  // B. 생산 정보 - 프리포메이션
  preFormationInputQuantity?: number;
  preFormationGoodQuantity?: number;
  preFormationDefectQuantity?: number;
  preFormationDiscardQuantity?: number;
  preFormationDefectRate?: number;

  // B. 생산 정보 - 프리포메이션 호기 1~5
  preFormation1UnitNumber?: string;
  preFormation1Quantity?: number;
  preFormation1CellNumberRange?: string;
  preFormation2UnitNumber?: string;
  preFormation2Quantity?: number;
  preFormation2CellNumberRange?: string;
  preFormation3UnitNumber?: string;
  preFormation3Quantity?: number;
  preFormation3CellNumberRange?: string;
  preFormation4UnitNumber?: string;
  preFormation4Quantity?: number;
  preFormation4CellNumberRange?: string;
  preFormation5UnitNumber?: string;
  preFormation5Quantity?: number;
  preFormation5CellNumberRange?: string;

  // B. 생산 정보 - 디가스2
  degas2InputQuantity?: number;
  degas2GoodQuantity?: number;
  degas2DefectQuantity?: number;
  degas2DiscardQuantity?: number;
  degas2DefectRate?: number;

  // B. 생산 정보 - 셀 프레스
  cellPressInputQuantity?: number;
  cellPressGoodQuantity?: number;
  cellPressDefectQuantity?: number;
  cellPressDiscardQuantity?: number;
  cellPressDefectRate?: number;

  // B. 생산 정보 - 파이널 실링
  finalSealingInputQuantity?: number;
  finalSealingGoodQuantity?: number;
  finalSealingDefectQuantity?: number;
  finalSealingDiscardQuantity?: number;
  finalSealingDefectRate?: number;

  // B. 생산 정보 - 실링 두께 1~5
  sealingThickness1?: number;
  sealingThickness2?: number;
  sealingThickness3?: number;
  sealingThickness4?: number;
  sealingThickness5?: number;

  // B. 생산 정보 - lot 마킹
  lotMarkingInputQuantity?: number;
  lotMarkingGoodQuantity?: number;
  lotMarkingDefectQuantity?: number;
  lotMarkingDiscardQuantity?: number;
  lotMarkingDefectRate?: number;

  // B. 생산 정보 - 메인포메이션
  mainFormationInputQuantity?: number;
  mainFormationGoodQuantity?: number;
  mainFormationDefectQuantity?: number;
  mainFormationDiscardQuantity?: number;
  mainFormationDefectRate?: number;

  // B. 생산 정보 - 메인포메이션 호기 1~5
  mainFormation1UnitNumber?: string;
  mainFormation1Quantity?: number;
  mainFormation1CellNumberRange?: string;
  mainFormation2UnitNumber?: string;
  mainFormation2Quantity?: number;
  mainFormation2CellNumberRange?: string;
  mainFormation3UnitNumber?: string;
  mainFormation3Quantity?: number;
  mainFormation3CellNumberRange?: string;
  mainFormation4UnitNumber?: string;
  mainFormation4Quantity?: number;
  mainFormation4CellNumberRange?: string;
  mainFormation5UnitNumber?: string;
  mainFormation5Quantity?: number;
  mainFormation5CellNumberRange?: string;

  // B. 생산 정보 - OCV1 & Lot
  ocv1Quantity?: number;
  lotRange?: string;

  // C. 공정 조건 - 프리포메이션
  preFormationVoltageCondition?: string;
  preFormationLowerVoltage?: number;
  preFormationUpperVoltage?: number;
  preFormationAppliedCurrent?: number;
  preFormationTemperature?: number;

  // C. 공정 조건 - 메인포메이션
  mainFormationVoltageCondition?: string;
  mainFormationLowerVoltage?: number;
  mainFormationUpperVoltage?: number;
  mainFormationAppliedCurrent?: number;
  mainFormationTemperature?: number;

  // C. 공정 조건 - 디가스
  degasVacuumHoldTime?: number;
  degasVacuumSealingAdhesionTime?: string;
  degasVacuumDegree?: number;

  // C. 공정 조건 - OCV1
  ocv1MeasurementEquipmentName?: string;
  ocv1VoltageSpec?: string;
}

export interface FormationWorklogPayload {
  workDate: string;
  round: number;

  // A. 자재 투입 정보
  cellNumberRange?: string;

  // B. 생산 정보 - 디가스1
  degas1InputQuantity?: number;
  degas1GoodQuantity?: number;
  degas1DefectQuantity?: number;
  degas1DiscardQuantity?: number;
  degas1DefectRate?: number;

  // B. 생산 정보 - 프리포메이션
  preFormationInputQuantity?: number;
  preFormationGoodQuantity?: number;
  preFormationDefectQuantity?: number;
  preFormationDiscardQuantity?: number;
  preFormationDefectRate?: number;

  // B. 생산 정보 - 프리포메이션 호기 1~5
  preFormation1UnitNumber?: string;
  preFormation1Quantity?: number;
  preFormation1CellNumberRange?: string;
  preFormation2UnitNumber?: string;
  preFormation2Quantity?: number;
  preFormation2CellNumberRange?: string;
  preFormation3UnitNumber?: string;
  preFormation3Quantity?: number;
  preFormation3CellNumberRange?: string;
  preFormation4UnitNumber?: string;
  preFormation4Quantity?: number;
  preFormation4CellNumberRange?: string;
  preFormation5UnitNumber?: string;
  preFormation5Quantity?: number;
  preFormation5CellNumberRange?: string;

  // B. 생산 정보 - 디가스2
  degas2InputQuantity?: number;
  degas2GoodQuantity?: number;
  degas2DefectQuantity?: number;
  degas2DiscardQuantity?: number;
  degas2DefectRate?: number;

  // B. 생산 정보 - 셀 프레스
  cellPressInputQuantity?: number;
  cellPressGoodQuantity?: number;
  cellPressDefectQuantity?: number;
  cellPressDiscardQuantity?: number;
  cellPressDefectRate?: number;

  // B. 생산 정보 - 파이널 실링
  finalSealingInputQuantity?: number;
  finalSealingGoodQuantity?: number;
  finalSealingDefectQuantity?: number;
  finalSealingDiscardQuantity?: number;
  finalSealingDefectRate?: number;

  // B. 생산 정보 - 실링 두께 1~5
  sealingThickness1?: number;
  sealingThickness2?: number;
  sealingThickness3?: number;
  sealingThickness4?: number;
  sealingThickness5?: number;

  // B. 생산 정보 - lot 마킹
  lotMarkingInputQuantity?: number;
  lotMarkingGoodQuantity?: number;
  lotMarkingDefectQuantity?: number;
  lotMarkingDiscardQuantity?: number;
  lotMarkingDefectRate?: number;

  // B. 생산 정보 - 메인포메이션
  mainFormationInputQuantity?: number;
  mainFormationGoodQuantity?: number;
  mainFormationDefectQuantity?: number;
  mainFormationDiscardQuantity?: number;
  mainFormationDefectRate?: number;

  // B. 생산 정보 - 메인포메이션 호기 1~5
  mainFormation1UnitNumber?: string;
  mainFormation1Quantity?: number;
  mainFormation1CellNumberRange?: string;
  mainFormation2UnitNumber?: string;
  mainFormation2Quantity?: number;
  mainFormation2CellNumberRange?: string;
  mainFormation3UnitNumber?: string;
  mainFormation3Quantity?: number;
  mainFormation3CellNumberRange?: string;
  mainFormation4UnitNumber?: string;
  mainFormation4Quantity?: number;
  mainFormation4CellNumberRange?: string;
  mainFormation5UnitNumber?: string;
  mainFormation5Quantity?: number;
  mainFormation5CellNumberRange?: string;

  // B. 생산 정보 - OCV1 & Lot
  ocv1Quantity?: number;
  lotRange?: string;

  // C. 공정 조건 - 프리포메이션
  preFormationVoltageCondition?: string;
  preFormationLowerVoltage?: number;
  preFormationUpperVoltage?: number;
  preFormationAppliedCurrent?: number;
  preFormationTemperature?: number;

  // C. 공정 조건 - 메인포메이션
  mainFormationVoltageCondition?: string;
  mainFormationLowerVoltage?: number;
  mainFormationUpperVoltage?: number;
  mainFormationAppliedCurrent?: number;
  mainFormationTemperature?: number;

  // C. 공정 조건 - 디가스
  degasVacuumHoldTime?: number;
  degasVacuumSealingAdhesionTime?: string;
  degasVacuumDegree?: number;

  // C. 공정 조건 - OCV1
  ocv1MeasurementEquipmentName?: string;
  ocv1VoltageSpec?: string;
}
