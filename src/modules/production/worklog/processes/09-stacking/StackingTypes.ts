// Stack 작업일지 타입 정의

export interface StackingWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // ===== A. 자재 투입 정보 (Material Input) =====
  // 분리막
  separatorLot?: string;
  separatorManufacturer?: string;
  separatorSpec?: string;
  separatorInputQuantity?: number;
  separatorUsage?: number;

  // 양극 매거진
  cathodeMagazineLot1?: string;
  cathodeMagazineLot2?: string;
  cathodeMagazineLot3?: string;

  // 음극 매거진
  anodeMagazineLot1?: string;
  anodeMagazineLot2?: string;
  anodeMagazineLot3?: string;

  // ===== B. 생산 정보 (Production Info) =====
  // 스택
  stackActualInput?: number;
  stackGoodQuantity?: number;
  stackDefectQuantity?: number;
  stackDiscardQuantity?: number;
  stackDefectRate?: number;

  // 하이팟1
  hipot1ActualInput?: number;
  hipot1GoodQuantity?: number;
  hipot1DefectQuantity?: number;
  hipot1DiscardQuantity?: number;
  hipot1DefectRate?: number;

  // JR 번호 1
  jr1Range?: string;
  jr1CathodeLot?: string;
  jr1AnodeLot?: string;
  jr1SeparatorLot?: string;
  jr1WorkTime?: string;
  jr1ElectrodeDefect?: number;

  // JR 번호 2
  jr2Range?: string;
  jr2CathodeLot?: string;
  jr2AnodeLot?: string;
  jr2SeparatorLot?: string;
  jr2WorkTime?: string;
  jr2ElectrodeDefect?: number;

  // JR 번호 3
  jr3Range?: string;
  jr3CathodeLot?: string;
  jr3AnodeLot?: string;
  jr3SeparatorLot?: string;
  jr3WorkTime?: string;
  jr3ElectrodeDefect?: number;

  // JR 번호 4
  jr4Range?: string;
  jr4CathodeLot?: string;
  jr4AnodeLot?: string;
  jr4SeparatorLot?: string;
  jr4WorkTime?: string;
  jr4ElectrodeDefect?: number;

  // ===== C. 공정 조건 (Process Conditions) =====
  jellyRollWeight?: number;
  jellyRollThickness?: number;
  separatorTopBottomDimension?: number;
  stackCount?: number;
  hipotVoltage?: number;
}

export interface StackingWorklogPayload {
  workDate: string;
  round: number;

  // ===== A. 자재 투입 정보 =====
  separatorLot?: string;
  separatorManufacturer?: string;
  separatorSpec?: string;
  separatorInputQuantity?: number;
  separatorUsage?: number;
  cathodeMagazineLot1?: string;
  cathodeMagazineLot2?: string;
  cathodeMagazineLot3?: string;
  anodeMagazineLot1?: string;
  anodeMagazineLot2?: string;
  anodeMagazineLot3?: string;

  // ===== B. 생산 정보 =====
  stackActualInput?: number;
  stackGoodQuantity?: number;
  stackDefectQuantity?: number;
  stackDiscardQuantity?: number;
  stackDefectRate?: number;
  hipot1ActualInput?: number;
  hipot1GoodQuantity?: number;
  hipot1DefectQuantity?: number;
  hipot1DiscardQuantity?: number;
  hipot1DefectRate?: number;
  jr1Range?: string;
  jr1CathodeLot?: string;
  jr1AnodeLot?: string;
  jr1SeparatorLot?: string;
  jr1WorkTime?: string;
  jr1ElectrodeDefect?: number;
  jr2Range?: string;
  jr2CathodeLot?: string;
  jr2AnodeLot?: string;
  jr2SeparatorLot?: string;
  jr2WorkTime?: string;
  jr2ElectrodeDefect?: number;
  jr3Range?: string;
  jr3CathodeLot?: string;
  jr3AnodeLot?: string;
  jr3SeparatorLot?: string;
  jr3WorkTime?: string;
  jr3ElectrodeDefect?: number;
  jr4Range?: string;
  jr4CathodeLot?: string;
  jr4AnodeLot?: string;
  jr4SeparatorLot?: string;
  jr4WorkTime?: string;
  jr4ElectrodeDefect?: number;

  // ===== C. 공정 조건 =====
  jellyRollWeight?: number;
  jellyRollThickness?: number;
  separatorTopBottomDimension?: number;
  stackCount?: number;
  hipotVoltage?: number;
}
