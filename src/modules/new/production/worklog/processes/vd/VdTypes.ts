// VD 작업일지 타입 정의

export interface VdWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // ===== A. 자재 투입 정보 (Material Input) =====
  // 양극 매거진 LOT
  cathodeMagazineLot1?: string;
  cathodeMagazineLot2?: string;
  cathodeMagazineLot3?: string;
  cathodeMagazineLot4?: string;
  cathodeMagazineLot5?: string;

  // 음극 매거진 LOT
  anodeMagazineLot1?: string;
  anodeMagazineLot2?: string;
  anodeMagazineLot3?: string;
  anodeMagazineLot4?: string;
  anodeMagazineLot5?: string;

  // ===== B. 생산 정보 (Production Info - 5회 반복) =====
  // 1차 - 양극
  cathodeLot1?: string;
  cathodeInputQuantity1?: number;
  cathodeInputOutputTime1?: string;
  cathodeMoistureMeasurement1?: number;

  // 1차 - 음극
  anodeLot1?: string;
  anodeInputQuantity1?: number;
  anodeInputOutputTime1?: string;
  anodeMoistureMeasurement1?: number;

  // 2차 - 양극
  cathodeLot2?: string;
  cathodeInputQuantity2?: number;
  cathodeInputOutputTime2?: string;
  cathodeMoistureMeasurement2?: number;

  // 2차 - 음극
  anodeLot2?: string;
  anodeInputQuantity2?: number;
  anodeInputOutputTime2?: string;
  anodeMoistureMeasurement2?: number;

  // 3차 - 양극
  cathodeLot3?: string;
  cathodeInputQuantity3?: number;
  cathodeInputOutputTime3?: string;
  cathodeMoistureMeasurement3?: number;

  // 3차 - 음극
  anodeLot3?: string;
  anodeInputQuantity3?: number;
  anodeInputOutputTime3?: string;
  anodeMoistureMeasurement3?: number;

  // 4차 - 양극
  cathodeLot4?: string;
  cathodeInputQuantity4?: number;
  cathodeInputOutputTime4?: string;
  cathodeMoistureMeasurement4?: number;

  // 4차 - 음극
  anodeLot4?: string;
  anodeInputQuantity4?: number;
  anodeInputOutputTime4?: string;
  anodeMoistureMeasurement4?: number;

  // 5차 - 양극
  cathodeLot5?: string;
  cathodeInputQuantity5?: number;
  cathodeInputOutputTime5?: string;
  cathodeMoistureMeasurement5?: number;

  // 5차 - 음극
  anodeLot5?: string;
  anodeInputQuantity5?: number;
  anodeInputOutputTime5?: string;
  anodeMoistureMeasurement5?: number;

  // ===== C. 공정 조건 (Process Conditions) =====
  vacuumDegreeSetting?: number;
  cathodeSetTemperature?: number;
  anodeSetTemperature?: number;
  cathodeTimerTime?: number;
  anodeTimerTime?: number;
}

export interface VdWorklogPayload {
  workDate: string;
  round: number;

  // ===== A. 자재 투입 정보 =====
  // 양극 매거진 LOT
  cathodeMagazineLot1?: string;
  cathodeMagazineLot2?: string;
  cathodeMagazineLot3?: string;
  cathodeMagazineLot4?: string;
  cathodeMagazineLot5?: string;

  // 음극 매거진 LOT
  anodeMagazineLot1?: string;
  anodeMagazineLot2?: string;
  anodeMagazineLot3?: string;
  anodeMagazineLot4?: string;
  anodeMagazineLot5?: string;

  // ===== B. 생산 정보 =====
  // 1차 - 양극
  cathodeLot1?: string;
  cathodeInputQuantity1?: number;
  cathodeInputOutputTime1?: string;
  cathodeMoistureMeasurement1?: number;

  // 1차 - 음극
  anodeLot1?: string;
  anodeInputQuantity1?: number;
  anodeInputOutputTime1?: string;
  anodeMoistureMeasurement1?: number;

  // 2차 - 양극
  cathodeLot2?: string;
  cathodeInputQuantity2?: number;
  cathodeInputOutputTime2?: string;
  cathodeMoistureMeasurement2?: number;

  // 2차 - 음극
  anodeLot2?: string;
  anodeInputQuantity2?: number;
  anodeInputOutputTime2?: string;
  anodeMoistureMeasurement2?: number;

  // 3차 - 양극
  cathodeLot3?: string;
  cathodeInputQuantity3?: number;
  cathodeInputOutputTime3?: string;
  cathodeMoistureMeasurement3?: number;

  // 3차 - 음극
  anodeLot3?: string;
  anodeInputQuantity3?: number;
  anodeInputOutputTime3?: string;
  anodeMoistureMeasurement3?: number;

  // 4차 - 양극
  cathodeLot4?: string;
  cathodeInputQuantity4?: number;
  cathodeInputOutputTime4?: string;
  cathodeMoistureMeasurement4?: number;

  // 4차 - 음극
  anodeLot4?: string;
  anodeInputQuantity4?: number;
  anodeInputOutputTime4?: string;
  anodeMoistureMeasurement4?: number;

  // 5차 - 양극
  cathodeLot5?: string;
  cathodeInputQuantity5?: number;
  cathodeInputOutputTime5?: string;
  cathodeMoistureMeasurement5?: number;

  // 5차 - 음극
  anodeLot5?: string;
  anodeInputQuantity5?: number;
  anodeInputOutputTime5?: string;
  anodeMoistureMeasurement5?: number;

  // ===== C. 공정 조건 =====
  vacuumDegreeSetting?: number;
  cathodeSetTemperature?: number;
  anodeSetTemperature?: number;
  cathodeTimerTime?: number;
  anodeTimerTime?: number;
}
