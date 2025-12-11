// Press 작업일지 타입 정의

export interface PressWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // ===== A. 자재 투입 정보 (Material Input) =====
  coatingRollLot1?: string;
  coatingRollLot2?: string;
  coatingRollLot3?: string;
  coatingRollLot4?: string;
  coatingRollLot5?: string;
  targetThickness?: number;

  // ===== B. 생산 정보 (Production Info - 5회 반복) =====
  // 1차
  coatingLot1?: string;
  pressLot1?: string;
  coatingQuantity1?: number;
  pressQuantity1?: number;
  weightPerAreaFront1M?: number;
  weightPerAreaFront1C?: number;
  weightPerAreaFront1D?: number;
  weightPerAreaRear1M?: number;
  weightPerAreaRear1C?: number;
  weightPerAreaRear1D?: number;
  thicknessFront1M?: number;
  thicknessFront1C?: number;
  thicknessFront1D?: number;
  thicknessRear1M?: number;
  thicknessRear1C?: number;
  thicknessRear1D?: number;

  // 2차
  coatingLot2?: string;
  pressLot2?: string;
  coatingQuantity2?: number;
  pressQuantity2?: number;
  weightPerAreaFront2M?: number;
  weightPerAreaFront2C?: number;
  weightPerAreaFront2D?: number;
  weightPerAreaRear2M?: number;
  weightPerAreaRear2C?: number;
  weightPerAreaRear2D?: number;
  thicknessFront2M?: number;
  thicknessFront2C?: number;
  thicknessFront2D?: number;
  thicknessRear2M?: number;
  thicknessRear2C?: number;
  thicknessRear2D?: number;

  // 3차
  coatingLot3?: string;
  pressLot3?: string;
  coatingQuantity3?: number;
  pressQuantity3?: number;
  weightPerAreaFront3M?: number;
  weightPerAreaFront3C?: number;
  weightPerAreaFront3D?: number;
  weightPerAreaRear3M?: number;
  weightPerAreaRear3C?: number;
  weightPerAreaRear3D?: number;
  thicknessFront3M?: number;
  thicknessFront3C?: number;
  thicknessFront3D?: number;
  thicknessRear3M?: number;
  thicknessRear3C?: number;
  thicknessRear3D?: number;

  // 4차
  coatingLot4?: string;
  pressLot4?: string;
  coatingQuantity4?: number;
  pressQuantity4?: number;
  weightPerAreaFront4M?: number;
  weightPerAreaFront4C?: number;
  weightPerAreaFront4D?: number;
  weightPerAreaRear4M?: number;
  weightPerAreaRear4C?: number;
  weightPerAreaRear4D?: number;
  thicknessFront4M?: number;
  thicknessFront4C?: number;
  thicknessFront4D?: number;
  thicknessRear4M?: number;
  thicknessRear4C?: number;
  thicknessRear4D?: number;

  // 5차
  coatingLot5?: string;
  pressLot5?: string;
  coatingQuantity5?: number;
  pressQuantity5?: number;
  weightPerAreaFront5M?: number;
  weightPerAreaFront5C?: number;
  weightPerAreaFront5D?: number;
  weightPerAreaRear5M?: number;
  weightPerAreaRear5C?: number;
  weightPerAreaRear5D?: number;
  thicknessFront5M?: number;
  thicknessFront5C?: number;
  thicknessFront5D?: number;
  thicknessRear5M?: number;
  thicknessRear5C?: number;
  thicknessRear5D?: number;

  // ===== C. 공정 조건 (Process Conditions) =====
  tensionUnT?: number;
  tensionReT?: number;
  pressSpeed?: number;
  pressureCondition?: number;
  rollGapLeft?: number;
  rollGapRight?: number;
  rollTemperatureMain?: number;
  rollTemperatureInfeed?: number;
}

export interface PressWorklogPayload {
  workDate: string;
  round: number;

  // ===== A. 자재 투입 정보 =====
  coatingRollLot1?: string;
  coatingRollLot2?: string;
  coatingRollLot3?: string;
  coatingRollLot4?: string;
  coatingRollLot5?: string;
  targetThickness?: number;

  // ===== B. 생산 정보 =====
  // 1차
  coatingLot1?: string;
  pressLot1?: string;
  coatingQuantity1?: number;
  pressQuantity1?: number;
  weightPerAreaFront1M?: number;
  weightPerAreaFront1C?: number;
  weightPerAreaFront1D?: number;
  weightPerAreaRear1M?: number;
  weightPerAreaRear1C?: number;
  weightPerAreaRear1D?: number;
  thicknessFront1M?: number;
  thicknessFront1C?: number;
  thicknessFront1D?: number;
  thicknessRear1M?: number;
  thicknessRear1C?: number;
  thicknessRear1D?: number;

  // 2차
  coatingLot2?: string;
  pressLot2?: string;
  coatingQuantity2?: number;
  pressQuantity2?: number;
  weightPerAreaFront2M?: number;
  weightPerAreaFront2C?: number;
  weightPerAreaFront2D?: number;
  weightPerAreaRear2M?: number;
  weightPerAreaRear2C?: number;
  weightPerAreaRear2D?: number;
  thicknessFront2M?: number;
  thicknessFront2C?: number;
  thicknessFront2D?: number;
  thicknessRear2M?: number;
  thicknessRear2C?: number;
  thicknessRear2D?: number;

  // 3차
  coatingLot3?: string;
  pressLot3?: string;
  coatingQuantity3?: number;
  pressQuantity3?: number;
  weightPerAreaFront3M?: number;
  weightPerAreaFront3C?: number;
  weightPerAreaFront3D?: number;
  weightPerAreaRear3M?: number;
  weightPerAreaRear3C?: number;
  weightPerAreaRear3D?: number;
  thicknessFront3M?: number;
  thicknessFront3C?: number;
  thicknessFront3D?: number;
  thicknessRear3M?: number;
  thicknessRear3C?: number;
  thicknessRear3D?: number;

  // 4차
  coatingLot4?: string;
  pressLot4?: string;
  coatingQuantity4?: number;
  pressQuantity4?: number;
  weightPerAreaFront4M?: number;
  weightPerAreaFront4C?: number;
  weightPerAreaFront4D?: number;
  weightPerAreaRear4M?: number;
  weightPerAreaRear4C?: number;
  weightPerAreaRear4D?: number;
  thicknessFront4M?: number;
  thicknessFront4C?: number;
  thicknessFront4D?: number;
  thicknessRear4M?: number;
  thicknessRear4C?: number;
  thicknessRear4D?: number;

  // 5차
  coatingLot5?: string;
  pressLot5?: string;
  coatingQuantity5?: number;
  pressQuantity5?: number;
  weightPerAreaFront5M?: number;
  weightPerAreaFront5C?: number;
  weightPerAreaFront5D?: number;
  weightPerAreaRear5M?: number;
  weightPerAreaRear5C?: number;
  weightPerAreaRear5D?: number;
  thicknessFront5M?: number;
  thicknessFront5C?: number;
  thicknessFront5D?: number;
  thicknessRear5M?: number;
  thicknessRear5C?: number;
  thicknessRear5D?: number;

  // ===== C. 공정 조건 =====
  tensionUnT?: number;
  tensionReT?: number;
  pressSpeed?: number;
  pressureCondition?: number;
  rollGapLeft?: number;
  rollGapRight?: number;
  rollTemperatureMain?: number;
  rollTemperatureInfeed?: number;
}
