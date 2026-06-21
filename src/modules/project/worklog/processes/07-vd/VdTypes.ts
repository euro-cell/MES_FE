// VD 작업일지 타입 정의

export interface VdWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  electrodeType?: string | null;
  updatedAt: string;
  manufactureDate: string;
  worker: string;
  line: string;
  plant: string;
  shift: string;

  // ===== 섹션2 - 전극 구분 =====
  upperElectrode?: string;
  lowerElectrode?: string;

  // ===== 섹션2 - LOT (오븐번호×층번호) =====
  // 상부 오븐1
  upperLot11?: string;
  upperLot12?: string;
  upperLot13?: string;
  // 상부 오븐2
  upperLot21?: string;
  upperLot22?: string;
  upperLot23?: string;
  // 상부 오븐3
  upperLot31?: string;
  upperLot32?: string;
  upperLot33?: string;
  // 하부 오븐1
  lowerLot11?: string;
  lowerLot12?: string;
  lowerLot13?: string;
  // 하부 오븐2
  lowerLot21?: string;
  lowerLot22?: string;
  lowerLot23?: string;
  // 하부 오븐3
  lowerLot31?: string;
  lowerLot32?: string;
  lowerLot33?: string;

  // ===== 섹션2 - 투입량 (오븐번호×층번호) =====
  // 상부 오븐1
  upperLotQty11?: number;
  upperLotQty12?: number;
  upperLotQty13?: number;
  // 상부 오븐2
  upperLotQty21?: number;
  upperLotQty22?: number;
  upperLotQty23?: number;
  // 상부 오븐3
  upperLotQty31?: number;
  upperLotQty32?: number;
  upperLotQty33?: number;
  // 하부 오븐1
  lowerLotQty11?: number;
  lowerLotQty12?: number;
  lowerLotQty13?: number;
  // 하부 오븐2
  lowerLotQty21?: number;
  lowerLotQty22?: number;
  lowerLotQty23?: number;
  // 하부 오븐3
  lowerLotQty31?: number;
  lowerLotQty32?: number;
  lowerLotQty33?: number;

  // ===== 섹션3 - 투입량/수분측정 (층번호) =====
  upperInputQuantity1?: number;
  upperInputQuantity2?: number;
  upperInputQuantity3?: number;
  upperMoistureMeasurement1?: number;
  upperMoistureMeasurement2?: number;
  upperMoistureMeasurement3?: number;
  upperInputOutputTime?: string;

  lowerInputQuantity1?: number;
  lowerInputQuantity2?: number;
  lowerInputQuantity3?: number;
  lowerMoistureMeasurement1?: number;
  lowerMoistureMeasurement2?: number;
  lowerMoistureMeasurement3?: number;
  lowerInputOutputTime?: string;

  // ===== 섹션3 - 두께 before VD (층번호F오븐번호) =====
  // 상부 before - 1층
  upperThicknessBefore1F1?: number;
  upperThicknessBefore1F2?: number;
  upperThicknessBefore1F3?: number;
  // 상부 before - 2층
  upperThicknessBefore2F1?: number;
  upperThicknessBefore2F2?: number;
  upperThicknessBefore2F3?: number;
  // 상부 before - 3층
  upperThicknessBefore3F1?: number;
  upperThicknessBefore3F2?: number;
  upperThicknessBefore3F3?: number;

  // ===== 섹션3 - 두께 after VD (층번호F오븐번호) =====
  // 상부 after - 1층
  upperThicknessAfter1F1?: number;
  upperThicknessAfter1F2?: number;
  upperThicknessAfter1F3?: number;
  // 상부 after - 2층
  upperThicknessAfter2F1?: number;
  upperThicknessAfter2F2?: number;
  upperThicknessAfter2F3?: number;
  // 상부 after - 3층
  upperThicknessAfter3F1?: number;
  upperThicknessAfter3F2?: number;
  upperThicknessAfter3F3?: number;

  // 하부 before - 1층
  lowerThicknessBefore1F1?: number;
  lowerThicknessBefore1F2?: number;
  lowerThicknessBefore1F3?: number;
  // 하부 before - 2층
  lowerThicknessBefore2F1?: number;
  lowerThicknessBefore2F2?: number;
  lowerThicknessBefore2F3?: number;
  // 하부 before - 3층
  lowerThicknessBefore3F1?: number;
  lowerThicknessBefore3F2?: number;
  lowerThicknessBefore3F3?: number;

  // 하부 after - 1층
  lowerThicknessAfter1F1?: number;
  lowerThicknessAfter1F2?: number;
  lowerThicknessAfter1F3?: number;
  // 하부 after - 2층
  lowerThicknessAfter2F1?: number;
  lowerThicknessAfter2F2?: number;
  lowerThicknessAfter2F3?: number;
  // 하부 after - 3층
  lowerThicknessAfter3F1?: number;
  lowerThicknessAfter3F2?: number;
  lowerThicknessAfter3F3?: number;

  // ===== 섹션4 - 공정 조건 =====
  vacuumDegreeSetting?: number;
  upperSetTemperature?: number;
  lowerSetTemperature?: number;
  upperTimerTime?: number;
  lowerTimerTime?: number;

  // ===== 섹션5 - 설비 정보 =====
  equipmentUpperNumber?: string;
  equipmentLowerNumber?: string;
  equipmentCheckResult?: string;
  equipmentIssue?: string;

  // ===== 섹션6 - 환경 및 기타 =====
  tempHumi?: string;
  cleanCheck?: string;
  safety?: string;

  // ===== 섹션7 - 비고 =====
  remark?: string;
}

export interface VdWorklogPayload {
  workDate: string;
  round: number;
  manufactureDate: string;
  worker: string;
  line: string;
  plant: any;
  shift: string;

  // ===== 섹션2 - 전극 구분 =====
  upperElectrode?: string;
  lowerElectrode?: string;

  // ===== 섹션2 - LOT =====
  upperLot11?: string;
  upperLot12?: string;
  upperLot13?: string;
  upperLot21?: string;
  upperLot22?: string;
  upperLot23?: string;
  upperLot31?: string;
  upperLot32?: string;
  upperLot33?: string;
  lowerLot11?: string;
  lowerLot12?: string;
  lowerLot13?: string;
  lowerLot21?: string;
  lowerLot22?: string;
  lowerLot23?: string;
  lowerLot31?: string;
  lowerLot32?: string;
  lowerLot33?: string;

  // ===== 섹션2 - 투입량 =====
  upperLotQty11?: number;
  upperLotQty12?: number;
  upperLotQty13?: number;
  upperLotQty21?: number;
  upperLotQty22?: number;
  upperLotQty23?: number;
  upperLotQty31?: number;
  upperLotQty32?: number;
  upperLotQty33?: number;
  lowerLotQty11?: number;
  lowerLotQty12?: number;
  lowerLotQty13?: number;
  lowerLotQty21?: number;
  lowerLotQty22?: number;
  lowerLotQty23?: number;
  lowerLotQty31?: number;
  lowerLotQty32?: number;
  lowerLotQty33?: number;

  // ===== 섹션3 - 투입량/수분측정 =====
  upperInputQuantity1?: number;
  upperInputQuantity2?: number;
  upperInputQuantity3?: number;
  upperMoistureMeasurement1?: number;
  upperMoistureMeasurement2?: number;
  upperMoistureMeasurement3?: number;
  upperInputOutputTime?: string;

  lowerInputQuantity1?: number;
  lowerInputQuantity2?: number;
  lowerInputQuantity3?: number;
  lowerMoistureMeasurement1?: number;
  lowerMoistureMeasurement2?: number;
  lowerMoistureMeasurement3?: number;
  lowerInputOutputTime?: string;

  // ===== 섹션3 - 두께 =====
  upperThicknessBefore1F1?: number;
  upperThicknessBefore1F2?: number;
  upperThicknessBefore1F3?: number;
  upperThicknessBefore2F1?: number;
  upperThicknessBefore2F2?: number;
  upperThicknessBefore2F3?: number;
  upperThicknessBefore3F1?: number;
  upperThicknessBefore3F2?: number;
  upperThicknessBefore3F3?: number;
  upperThicknessAfter1F1?: number;
  upperThicknessAfter1F2?: number;
  upperThicknessAfter1F3?: number;
  upperThicknessAfter2F1?: number;
  upperThicknessAfter2F2?: number;
  upperThicknessAfter2F3?: number;
  upperThicknessAfter3F1?: number;
  upperThicknessAfter3F2?: number;
  upperThicknessAfter3F3?: number;
  lowerThicknessBefore1F1?: number;
  lowerThicknessBefore1F2?: number;
  lowerThicknessBefore1F3?: number;
  lowerThicknessBefore2F1?: number;
  lowerThicknessBefore2F2?: number;
  lowerThicknessBefore2F3?: number;
  lowerThicknessBefore3F1?: number;
  lowerThicknessBefore3F2?: number;
  lowerThicknessBefore3F3?: number;
  lowerThicknessAfter1F1?: number;
  lowerThicknessAfter1F2?: number;
  lowerThicknessAfter1F3?: number;
  lowerThicknessAfter2F1?: number;
  lowerThicknessAfter2F2?: number;
  lowerThicknessAfter2F3?: number;
  lowerThicknessAfter3F1?: number;
  lowerThicknessAfter3F2?: number;
  lowerThicknessAfter3F3?: number;

  // ===== 섹션4 - 공정 조건 =====
  vacuumDegreeSetting?: number;
  upperSetTemperature?: number;
  lowerSetTemperature?: number;
  upperTimerTime?: number;
  lowerTimerTime?: number;

  // ===== 섹션5 - 설비 정보 =====
  equipmentUpperNumber?: string;
  equipmentLowerNumber?: string;
  equipmentCheckResult?: string;
  equipmentIssue?: string;

  // ===== 섹션6 - 환경 및 기타 =====
  tempHumi?: string;
  cleanCheck?: string;
  safety?: string;

  // ===== 섹션7 - 비고 =====
  remark?: string;
}
