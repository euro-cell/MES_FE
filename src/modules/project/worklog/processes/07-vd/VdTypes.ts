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
  manufactureDate: string;
  worker: string;
  line: string;
  plant: string;
  shift: string;

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
  // 1차 - 상단
  upperLot1?: string;
  upperInputQuantity1?: number;
  upperInputOutputTime1?: string;
  upperMoistureMeasurement1?: number;

  // 1차 - 하단
  lowerLot1?: string;
  lowerInputQuantity1?: number;
  lowerInputOutputTime1?: string;
  lowerMoistureMeasurement1?: number;

  // 2차 - 상단
  upperLot2?: string;
  upperInputQuantity2?: number;
  upperInputOutputTime2?: string;
  upperMoistureMeasurement2?: number;

  // 2차 - 하단
  lowerLot2?: string;
  lowerInputQuantity2?: number;
  lowerInputOutputTime2?: string;
  lowerMoistureMeasurement2?: number;

  // 3차 - 상단
  upperLot3?: string;
  upperInputQuantity3?: number;
  upperInputOutputTime3?: string;
  upperMoistureMeasurement3?: number;

  // 3차 - 하단
  lowerLot3?: string;
  lowerInputQuantity3?: number;
  lowerInputOutputTime3?: string;
  lowerMoistureMeasurement3?: number;

  // 4차 - 상단
  upperLot4?: string;
  upperInputQuantity4?: number;
  upperInputOutputTime4?: string;
  upperMoistureMeasurement4?: number;

  // 4차 - 하단
  lowerLot4?: string;
  lowerInputQuantity4?: number;
  lowerInputOutputTime4?: string;
  lowerMoistureMeasurement4?: number;

  // 5차 - 상단
  upperLot5?: string;
  upperInputQuantity5?: number;
  upperInputOutputTime5?: string;
  upperMoistureMeasurement5?: number;

  // 5차 - 하단
  lowerLot5?: string;
  lowerInputQuantity5?: number;
  lowerInputOutputTime5?: string;
  lowerMoistureMeasurement5?: number;

  // ===== C. 공정 조건 (Process Conditions) =====
  vacuumDegreeSetting?: number;
  upperSetTemperature?: number;
  lowerSetTemperature?: number;
  upperTimerTime?: number;
  lowerTimerTime?: number;
}

export interface VdWorklogPayload {
  workDate: string;
  round: number;
  manufactureDate: string;
  worker: string;
  line: string;
  plant: any;
  shift: string;

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
  // 1차 - 상단
  upperLot1?: string;
  upperInputQuantity1?: number;
  upperInputOutputTime1?: string;
  upperMoistureMeasurement1?: number;

  // 1차 - 하단
  lowerLot1?: string;
  lowerInputQuantity1?: number;
  lowerInputOutputTime1?: string;
  lowerMoistureMeasurement1?: number;

  // 2차 - 상단
  upperLot2?: string;
  upperInputQuantity2?: number;
  upperInputOutputTime2?: string;
  upperMoistureMeasurement2?: number;

  // 2차 - 하단
  lowerLot2?: string;
  lowerInputQuantity2?: number;
  lowerInputOutputTime2?: string;
  lowerMoistureMeasurement2?: number;

  // 3차 - 상단
  upperLot3?: string;
  upperInputQuantity3?: number;
  upperInputOutputTime3?: string;
  upperMoistureMeasurement3?: number;

  // 3차 - 하단
  lowerLot3?: string;
  lowerInputQuantity3?: number;
  lowerInputOutputTime3?: string;
  lowerMoistureMeasurement3?: number;

  // 4차 - 상단
  upperLot4?: string;
  upperInputQuantity4?: number;
  upperInputOutputTime4?: string;
  upperMoistureMeasurement4?: number;

  // 4차 - 하단
  lowerLot4?: string;
  lowerInputQuantity4?: number;
  lowerInputOutputTime4?: string;
  lowerMoistureMeasurement4?: number;

  // 5차 - 상단
  upperLot5?: string;
  upperInputQuantity5?: number;
  upperInputOutputTime5?: string;
  upperMoistureMeasurement5?: number;

  // 5차 - 하단
  lowerLot5?: string;
  lowerInputQuantity5?: number;
  lowerInputOutputTime5?: string;
  lowerMoistureMeasurement5?: number;

  // ===== C. 공정 조건 =====
  vacuumDegreeSetting?: number;
  upperSetTemperature?: number;
  lowerSetTemperature?: number;
  upperTimerTime?: number;
  lowerTimerTime?: number;
}
