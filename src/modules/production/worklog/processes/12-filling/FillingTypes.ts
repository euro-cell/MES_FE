export interface FillingWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // A. 자재 투입 정보
  electrolyteLot?: string;
  electrolyteManufacturer?: string;
  electrolyteSpec?: string;
  electrolyteUsage?: number;

  // B. 생산 정보 - 필링
  fillingWorkQuantity?: number;
  fillingGoodQuantity?: number;
  fillingDefectQuantity?: number;
  fillingDiscardQuantity?: number;
  fillingDefectRate?: number;

  // B. 생산 정보 - 웨이팅
  waitingWorkQuantity?: number;
  waitingGoodQuantity?: number;
  waitingDefectQuantity?: number;
  waitingDiscardQuantity?: number;
  waitingDefectRate?: number;

  // C. 공정 조건 - 필링
  fillingEquipmentInjectionAmount?: number;
  fillingSpecInjectionAmount?: number;
  fillingInjectionSpeed?: number;
  fillingSpecificGravity?: number;

  // C. 공정 조건 - 웨이팅 구분 1
  waiting1RepeatCount?: number;
  waiting1PressureRange?: string;
  waiting1HoldTime?: number;

  // C. 공정 조건 - 웨이팅 구분 2
  waiting2RepeatCount?: number;
  waiting2PressureRange?: string;
  waiting2HoldTime?: number;

  // C. 공정 조건 - 웨이팅 구분 3
  waiting3RepeatCount?: number;
  waiting3PressureRange?: string;
  waiting3HoldTime?: number;
}

export interface FillingWorklogPayload {
  workDate: string;
  round: number;

  // A. 자재 투입 정보
  electrolyteLot?: string;
  electrolyteManufacturer?: string;
  electrolyteSpec?: string;
  electrolyteUsage?: number;

  // B. 생산 정보 - 필링
  fillingWorkQuantity?: number;
  fillingGoodQuantity?: number;
  fillingDefectQuantity?: number;
  fillingDiscardQuantity?: number;
  fillingDefectRate?: number;

  // B. 생산 정보 - 웨이팅
  waitingWorkQuantity?: number;
  waitingGoodQuantity?: number;
  waitingDefectQuantity?: number;
  waitingDiscardQuantity?: number;
  waitingDefectRate?: number;

  // C. 공정 조건 - 필링
  fillingEquipmentInjectionAmount?: number;
  fillingSpecInjectionAmount?: number;
  fillingInjectionSpeed?: number;
  fillingSpecificGravity?: number;

  // C. 공정 조건 - 웨이팅 구분 1
  waiting1RepeatCount?: number;
  waiting1PressureRange?: string;
  waiting1HoldTime?: number;

  // C. 공정 조건 - 웨이팅 구분 2
  waiting2RepeatCount?: number;
  waiting2PressureRange?: string;
  waiting2HoldTime?: number;

  // C. 공정 조건 - 웨이팅 구분 3
  waiting3RepeatCount?: number;
  waiting3PressureRange?: string;
  waiting3HoldTime?: number;
}
