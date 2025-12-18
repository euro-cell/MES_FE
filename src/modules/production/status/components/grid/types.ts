// 일반 공정 일별 데이터
export interface DayData {
  day: number;
  output: number;
  ng: number | null;
  yield: number | null;
}

// Forming 서브타입 일별 데이터 (yield 없음)
export interface FormingSubTypeDayData {
  day: number;
  output: number;
  ng: number | null;
}

// Forming 수율 일별 데이터
export interface FormingYieldDayData {
  day: number;
  yield: number | null;
}

// Forming 서브타입 데이터 (yield 없음)
export interface FormingSubTypeData {
  data: FormingSubTypeDayData[];
  total: {
    totalOutput: number;
    targetQuantity: number | null;
    progress: number | null;
    totalNg?: number | null;
  };
}

// Forming 수율 데이터
export interface FormingYieldData {
  data: FormingYieldDayData[];
  total: number | null;
}

// 일반 공정 데이터
export interface ProcessData {
  data: DayData[];
  total: {
    totalOutput: number;
    cumulativeOutput?: number | null;
    targetQuantity: number | null;
    progress: number | null;
    totalNg?: number | null;
    totalYield?: number | null;
  };
}

// VD 공정 일별 데이터 (Cathode/Anode 분리)
export interface VDDayData {
  day: number;
  cathodeOutput: number;
  anodeOutput: number;
  cathodeNg: number | null;
  anodeNg: number | null;
  cathodeYield: number | null;
  anodeYield: number | null;
}

// VD 공정 total 구조
export interface VDTotal {
  cathode: {
    totalOutput: number;
    cumulativeOutput?: number | null;
    targetQuantity: number | null;
    progress: number | null;
    totalNg: number | null;
    totalYield: number | null;
  };
  anode: {
    totalOutput: number;
    cumulativeOutput?: number | null;
    targetQuantity: number | null;
    progress: number | null;
    totalNg: number | null;
    totalYield: number | null;
  };
}

// VD 공정 데이터
export interface VDProcessData {
  data: VDDayData[];
  total: VDTotal;
}

// Forming 공정 데이터 (4개 서브타입 + 별도 yield + 최상위 targetQuantity, progress)
export interface FormingProcessData {
  cutting: FormingSubTypeData;
  forming: FormingSubTypeData;
  folding: FormingSubTypeData;
  topCutting: FormingSubTypeData;
  yield: FormingYieldData;
  targetQuantity: number | null;
  cumulativeOutput?: number | null;
  progress: number | null;
}

// Stacking 일별 데이터
export interface StackingDayData {
  day: number;
  output: number;
  ng: number | null;
  ncr: {
    hiPot: number | null;
    weight: number | null;
    thickness: number | null;
    alignment: number | null;
  } | null;
  yield: number | null;
}

// Stacking 공정 데이터
export interface StackingProcessData {
  data: StackingDayData[];
  total: {
    totalOutput: number;
    cumulativeOutput?: number | null;
    targetQuantity: number | null;
    progress: number | null;
    totalNg: number | null;
    ncr: {
      hiPot: number | null;
      weight: number | null;
      thickness: number | null;
      alignment: number | null;
    } | null;
    totalYield: number | null;
  };
}

// Welding 공정 일별 데이터 (NCR 동적)
export interface WeldingDayData {
  day: number;
  output: number;
  ng: number | null;
  ncr: Record<string, number | null> | null;
  yield: number | null;
}

// Welding 공정 데이터
export interface WeldingProcessData {
  data: WeldingDayData[];
  total: {
    totalOutput: number;
    cumulativeOutput?: number | null;
    targetQuantity: number | null;
    progress: number | null;
    totalNg: number | null;
    ncr: Record<string, number | null> | null;
    totalYield: number | null;
  };
}

// Sealing 공정 일별 데이터
export interface SealingDayData {
  day: number;
  output: number;
  ng: number | null;
  ncr: Record<string, number | null> | null;
  yield: number | null;
}

// Sealing 공정 데이터
export interface SealingProcessData {
  data: SealingDayData[];
  total: {
    totalOutput: number;
    cumulativeOutput?: number | null;
    targetQuantity: number | null;
    progress: number | null;
    totalNg: number | null;
    ncr: Record<string, number | null> | null;
    totalYield: number | null;
  };
}

// VisualInspection 공정 일별 데이터
export interface VisualInspectionDayData {
  day: number;
  output: number;
  ng: number | null;
  ncr: Record<string, number | null> | null;
  yield: number | null;
}

// VisualInspection 공정 데이터
export interface VisualInspectionProcessData {
  data: VisualInspectionDayData[];
  total: {
    totalOutput: number;
    cumulativeOutput?: number | null;
    targetQuantity: number | null;
    progress: number | null;
    totalNg: number | null;
    ncr: Record<string, number | null> | null;
    totalYield: number | null;
  };
}

// 전체 공정 데이터 유니온 타입
export type AllProcessData =
  | ProcessData
  | VDProcessData
  | FormingProcessData
  | StackingProcessData
  | WeldingProcessData
  | SealingProcessData
  | VisualInspectionProcessData;

// 실제 데이터 응답
export interface RealDataResponse {
  category: string;
  type?: string;
  month: string;
  processes: {
    // 전극 공정 (Electrode)
    mixing?: ProcessData;
    coatingSingle?: ProcessData;
    coatingDouble?: ProcessData;
    press?: ProcessData;
    slitting?: ProcessData;
    notching?: ProcessData;
    // 조립 공정 (Assembly)
    vd?: VDProcessData;
    forming?: FormingProcessData;
    stacking?: StackingProcessData;
    preWelding?: WeldingProcessData;
    mainWelding?: WeldingProcessData;
    sealing?: SealingProcessData;
    filling?: ProcessData;
    // 화성 공정 (Formation)
    preFormation?: ProcessData;
    degass?: ProcessData;
    mainFormation?: ProcessData;
    aging?: ProcessData;
    grading?: ProcessData;
    visualInspection?: VisualInspectionProcessData;
    [key: string]:
      | ProcessData
      | VDProcessData
      | FormingProcessData
      | StackingProcessData
      | WeldingProcessData
      | SealingProcessData
      | VisualInspectionProcessData
      | undefined;
  };
}

// 그리드 공통 Props
export interface ProcessGridProps {
  daysInMonth: number;
  getDateClassName: (day: number) => string;
  onTargetChange?: (processKey: string, subType?: string) => void;
}
