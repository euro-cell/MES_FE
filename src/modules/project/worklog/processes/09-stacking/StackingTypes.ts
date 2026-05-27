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

  line?: string;
  plant?: string;

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
  jr1CathodeDefect?: number;
  jr1AnodeDefect?: number;

  // JR 번호 2
  jr2Range?: string;
  jr2CathodeLot?: string;
  jr2AnodeLot?: string;
  jr2SeparatorLot?: string;
  jr2WorkTime?: string;
  jr2CathodeDefect?: number;
  jr2AnodeDefect?: number;

  // JR 번호 3
  jr3Range?: string;
  jr3CathodeLot?: string;
  jr3AnodeLot?: string;
  jr3SeparatorLot?: string;
  jr3WorkTime?: string;
  jr3CathodeDefect?: number;
  jr3AnodeDefect?: number;

  // JR 번호 4
  jr4Range?: string;
  jr4CathodeLot?: string;
  jr4AnodeLot?: string;
  jr4SeparatorLot?: string;
  jr4WorkTime?: string;
  jr4CathodeDefect?: number;
  jr4AnodeDefect?: number;

  // JR 번호 5
  jr5Range?: string;
  jr5CathodeLot?: string;
  jr5AnodeLot?: string;
  jr5SeparatorLot?: string;
  jr5WorkTime?: string;
  jr5CathodeDefect?: number;
  jr5AnodeDefect?: number;

  // JR 번호 6
  jr6Range?: string;
  jr6CathodeLot?: string;
  jr6AnodeLot?: string;
  jr6SeparatorLot?: string;
  jr6WorkTime?: string;
  jr6CathodeDefect?: number;
  jr6AnodeDefect?: number;

  // JR 번호 7
  jr7Range?: string;
  jr7CathodeLot?: string;
  jr7AnodeLot?: string;
  jr7SeparatorLot?: string;
  jr7WorkTime?: string;
  jr7CathodeDefect?: number;
  jr7AnodeDefect?: number;

  // JR 번호 8
  jr8Range?: string;
  jr8CathodeLot?: string;
  jr8AnodeLot?: string;
  jr8SeparatorLot?: string;
  jr8WorkTime?: string;
  jr8CathodeDefect?: number;
  jr8AnodeDefect?: number;

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
  line?: string;
  plant?: any;

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
  jr1CathodeDefect?: number;
  jr1AnodeDefect?: number;
  jr2Range?: string;
  jr2CathodeLot?: string;
  jr2AnodeLot?: string;
  jr2SeparatorLot?: string;
  jr2WorkTime?: string;
  jr2CathodeDefect?: number;
  jr2AnodeDefect?: number;
  jr3Range?: string;
  jr3CathodeLot?: string;
  jr3AnodeLot?: string;
  jr3SeparatorLot?: string;
  jr3WorkTime?: string;
  jr3CathodeDefect?: number;
  jr3AnodeDefect?: number;
  jr4Range?: string;
  jr4CathodeLot?: string;
  jr4AnodeLot?: string;
  jr4SeparatorLot?: string;
  jr4WorkTime?: string;
  jr4CathodeDefect?: number;
  jr4AnodeDefect?: number;
  jr5Range?: string;
  jr5CathodeLot?: string;
  jr5AnodeLot?: string;
  jr5SeparatorLot?: string;
  jr5WorkTime?: string;
  jr5CathodeDefect?: number;
  jr5AnodeDefect?: number;
  jr6Range?: string;
  jr6CathodeLot?: string;
  jr6AnodeLot?: string;
  jr6SeparatorLot?: string;
  jr6WorkTime?: string;
  jr6CathodeDefect?: number;
  jr6AnodeDefect?: number;
  jr7Range?: string;
  jr7CathodeLot?: string;
  jr7AnodeLot?: string;
  jr7SeparatorLot?: string;
  jr7WorkTime?: string;
  jr7CathodeDefect?: number;
  jr7AnodeDefect?: number;
  jr8Range?: string;
  jr8CathodeLot?: string;
  jr8AnodeLot?: string;
  jr8SeparatorLot?: string;
  jr8WorkTime?: string;
  jr8CathodeDefect?: number;
  jr8AnodeDefect?: number;

  // ===== C. 공정 조건 =====
  jellyRollWeight?: number;
  jellyRollThickness?: number;
  separatorTopBottomDimension?: number;
  stackCount?: number;
  hipotVoltage?: number;
}
