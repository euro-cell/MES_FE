// Notching 작업일지 타입 정의

export interface NotchingWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // ===== A. 자재 투입 정보 (Material Input) =====
  pressRollLot1?: string;
  pressRollLot2?: string;
  pressRollLot3?: string;
  pressRollLot4?: string;
  pressRollLot5?: string;

  // ===== B. 생산 정보 (Production Info - 5회 반복) =====
  // 1차
  pressLot1?: string;
  pressQuantity1?: number;
  notchingLot1?: string;
  notchingQuantity1?: number;
  defectQuantity1?: number;
  goodQuantity1?: number;
  dimension1?: number;
  burr1?: number;
  damage1?: number;
  nonCutting1?: number;
  overTab1?: number;
  wide1?: number;
  length1?: number;
  missMatch1?: number;

  // 2차
  pressLot2?: string;
  pressQuantity2?: number;
  notchingLot2?: string;
  notchingQuantity2?: number;
  defectQuantity2?: number;
  goodQuantity2?: number;
  dimension2?: number;
  burr2?: number;
  damage2?: number;
  nonCutting2?: number;
  overTab2?: number;
  wide2?: number;
  length2?: number;
  missMatch2?: number;

  // 3차
  pressLot3?: string;
  pressQuantity3?: number;
  notchingLot3?: string;
  notchingQuantity3?: number;
  defectQuantity3?: number;
  goodQuantity3?: number;
  dimension3?: number;
  burr3?: number;
  damage3?: number;
  nonCutting3?: number;
  overTab3?: number;
  wide3?: number;
  length3?: number;
  missMatch3?: number;

  // 4차
  pressLot4?: string;
  pressQuantity4?: number;
  notchingLot4?: string;
  notchingQuantity4?: number;
  defectQuantity4?: number;
  goodQuantity4?: number;
  dimension4?: number;
  burr4?: number;
  damage4?: number;
  nonCutting4?: number;
  overTab4?: number;
  wide4?: number;
  length4?: number;
  missMatch4?: number;

  // 5차
  pressLot5?: string;
  pressQuantity5?: number;
  notchingLot5?: string;
  notchingQuantity5?: number;
  defectQuantity5?: number;
  goodQuantity5?: number;
  dimension5?: number;
  burr5?: number;
  damage5?: number;
  nonCutting5?: number;
  overTab5?: number;
  wide5?: number;
  length5?: number;
  missMatch5?: number;

  // ===== C. 공정 조건 (Process Conditions) =====
  tension?: number;
  punchingSpeed?: number;
}

export interface NotchingWorklogPayload {
  workDate: string;
  round: number;

  // ===== A. 자재 투입 정보 =====
  pressRollLot1?: string;
  pressRollLot2?: string;
  pressRollLot3?: string;
  pressRollLot4?: string;
  pressRollLot5?: string;

  // ===== B. 생산 정보 =====
  // 1차
  pressLot1?: string;
  pressQuantity1?: number;
  notchingLot1?: string;
  notchingQuantity1?: number;
  defectQuantity1?: number;
  goodQuantity1?: number;
  dimension1?: number;
  burr1?: number;
  damage1?: number;
  nonCutting1?: number;
  overTab1?: number;
  wide1?: number;
  length1?: number;
  missMatch1?: number;

  // 2차
  pressLot2?: string;
  pressQuantity2?: number;
  notchingLot2?: string;
  notchingQuantity2?: number;
  defectQuantity2?: number;
  goodQuantity2?: number;
  dimension2?: number;
  burr2?: number;
  damage2?: number;
  nonCutting2?: number;
  overTab2?: number;
  wide2?: number;
  length2?: number;
  missMatch2?: number;

  // 3차
  pressLot3?: string;
  pressQuantity3?: number;
  notchingLot3?: string;
  notchingQuantity3?: number;
  defectQuantity3?: number;
  goodQuantity3?: number;
  dimension3?: number;
  burr3?: number;
  damage3?: number;
  nonCutting3?: number;
  overTab3?: number;
  wide3?: number;
  length3?: number;
  missMatch3?: number;

  // 4차
  pressLot4?: string;
  pressQuantity4?: number;
  notchingLot4?: string;
  notchingQuantity4?: number;
  defectQuantity4?: number;
  goodQuantity4?: number;
  dimension4?: number;
  burr4?: number;
  damage4?: number;
  nonCutting4?: number;
  overTab4?: number;
  wide4?: number;
  length4?: number;
  missMatch4?: number;

  // 5차
  pressLot5?: string;
  pressQuantity5?: number;
  notchingLot5?: string;
  notchingQuantity5?: number;
  defectQuantity5?: number;
  goodQuantity5?: number;
  dimension5?: number;
  burr5?: number;
  damage5?: number;
  nonCutting5?: number;
  overTab5?: number;
  wide5?: number;
  length5?: number;
  missMatch5?: number;

  // ===== C. 공정 조건 =====
  tension?: number;
  punchingSpeed?: number;
}
