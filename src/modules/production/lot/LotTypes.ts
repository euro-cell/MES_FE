export interface LotProject {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
}

export interface ProcessInfo {
  id: string;
  title: string;
}

export interface CategoryInfo {
  id: string;
  title: string;
}

// Mixing 공정 데이터 (API 응답 구조)
export interface MixingBinder {
  viscosity: number | null;
  solidContent1: number;
  solidContent2: number;
  solidContent3: number | null;
}

export interface MixingSlurry {
  tempHumi: string;
  activeMaterialInput: number;
  viscosityAfterMixing: number;
  viscosityAfterDefoaming: number;
  viscosityAfterStabilization: number;
  solidContent1: number;
  solidContent2: number;
  solidContent3: number;
  grindGage: string;
}

export interface MixingData {
  id: number;
  lot: string;
  processDate: string;
  binder: MixingBinder;
  slurry: MixingSlurry;
}

// Sync 상태 응답
export interface SyncStatus {
  id: number;
  process: string;
  syncedAt: string;
}

// Coating 공정 데이터
export interface CoatingAtCoating {
  temp: number;
  humidity: number;
}

export interface CoatingElectrodeSpec {
  coatLength: number;
  coatingWidth: number;
  loadingWeight: number;
}

// Start/End 값 (전단/후단)
export interface StartEndValue {
  start: number;
  end: number;
}

// A-Side Coat Weight (OP, Mid, Gear - 각각 Start/End)
export interface CoatingASideCoatWeight {
  op: StartEndValue;
  mid: StartEndValue;
  gear: StartEndValue;
  webSpeed: number;
  pump: StartEndValue;
}

// Both Coat Weight (OP, Mid, Gear - 각각 Start/End)
export interface CoatingBothCoatWeight {
  op: StartEndValue;
  mid: StartEndValue;
  gear: StartEndValue;
  webSpeed: number;
  pump: number;
}

// Both Coat Thickness (OP, Mid, Gear - 각각 Start/End)
export interface CoatingBothCoatThickness {
  op: StartEndValue;
  mid: StartEndValue;
  gear: StartEndValue;
}

export interface CoatingInspection {
  aSideCoatWeight: CoatingASideCoatWeight;
  bothCoatWeight: CoatingBothCoatWeight;
  bothCoatThickness: CoatingBothCoatThickness;
  misalignment: number;
}

export interface CoatingDryingCondition {
  temperature: {
    zone1: StartEndValue; // 2줄
    zone2: StartEndValue; // 2줄
    zone3: number; // 1줄
    zone4: number; // 1줄
  };
  supply: {
    zone1: StartEndValue; // 2줄
    zone2: StartEndValue; // 2줄
    zone3: number; // 1줄
    zone4: number; // 1줄
  };
  exhaust: {
    zone2: number; // 1줄
    zone4: number; // 1줄
  };
}

export interface CoatingSlurryInfo {
  lot: string;
  viscosity: number;
  solidContent: number;
}

export interface CoatingFoilInfo {
  lot: string;
  type: string;
  length: number;
  width: number;
  thickness: number;
}

export interface CoatingData {
  id: number;
  coatingDate: string;
  lot: string;
  atCoating: CoatingAtCoating;
  electrodeSpec: CoatingElectrodeSpec;
  inspection: CoatingInspection;
  dryingCondition: CoatingDryingCondition;
  slurryInfo: CoatingSlurryInfo;
  foilInfo: CoatingFoilInfo;
}

// Calendering 공정 데이터
export interface CalenderingAtCalendering {
  temp: number;
  humidity: number;
}

export interface CalenderingElectrodeSpec {
  pressingThick: number;
  loadingWeight: number;
}

export interface CalenderingThickness {
  op: StartEndValue; // 전단/후단
  mid: StartEndValue; // 전단/후단
  gear: StartEndValue; // 전단/후단
}

export interface CalenderingCoatWeight {
  spec: number;
  p1: number;
  p3: number;
  p4: number;
}

export interface CalenderingRealInspection {
  conditions: string;
  pressingTemp: number;
  thickness: CalenderingThickness;
  coatWeight: CalenderingCoatWeight;
}

export interface CalenderingData {
  id: number;
  calenderingDate: string;
  lot: string;
  atCalendering: CalenderingAtCalendering;
  calenderingLen: number; // Both - Calendering Len (m)
  electrodeSpec: CalenderingElectrodeSpec;
  realInspection: CalenderingRealInspection;
}

// Slitting 공정 데이터
export interface SlittingAtSlitting {
  temp: number;
  humidity: number;
}

export interface SlittingData {
  id: number;
  slittingDate: string;
  lot: string;
  atSlitting: SlittingAtSlitting;
  slittingLength: number; // m
  slittingWidth: number; // mm
}

// Notching 공정 데이터
export interface NotchingAtNotching {
  temp: number;
  humidity: number;
}

export interface NotchingElectrodeSpec {
  overTab: number; // mm
  wide: number; // mm
  length: number; // mm
  missMatch: number; // >mm
}

export interface NotchingProduction {
  totalOutput: number; // ea
  defective: number; // ea
  quantity: number; // ea
  fractionDefective: number; // %
}

export interface NotchingData {
  id: number;
  notchingDate: string;
  lot: string;
  atNotching: NotchingAtNotching;
  electrodeSpec: NotchingElectrodeSpec;
  production: NotchingProduction;
}

// Stacking 공정 데이터
export interface StackingAtStacking {
  temp: number;
  humidity: number;
}

export interface StackingJellyrollSpec {
  stack: string; // 양/음
  weight: string; // P/NP
  thickness: string; // P/NP
  alignment: string; // P/NP (Top/Bottom)
  ir: string; // P/NP
}

export interface StackingMagazineNotching {
  row1: string;
  row2: string;
}

export interface StackingMagazine {
  notchingAnode: StackingMagazineNotching; // 양극 (2행)
  notchingCathode: StackingMagazineNotching; // 음극 (2행)
  separate: string;
}

export interface StackingData {
  id: number;
  productionDate: string;
  lot: string;
  isDefective?: boolean;
  atStacking: StackingAtStacking;
  jellyrollSpec: StackingJellyrollSpec;
  magazine: StackingMagazine;
}

// Welding 공정 데이터
export interface WeldingAtWelding {
  temp: number;
  humidity: number;
}

export interface WeldingPreWelding {
  weldingPosition: string; // P/N
  trimPosition: string; // P/N
}

export interface WeldingMainWelding {
  weldingPosition: string; // P/N
  irCheck: string; // P/N
  taping: string; // P/N
}

export interface WeldingData {
  id: number;
  weldingDate: string;
  lot: string;
  isDefectiveFromStacking?: boolean;
  isDefectiveFromWelding?: boolean;
  atWelding: WeldingAtWelding;
  preWelding: WeldingPreWelding;
  mainWelding: WeldingMainWelding;
}

// Sealing/Filling 공정 데이터
export interface SealingAtAssy {
  temp: number;
  humidity: number;
}

export interface SealingTopSealing {
  sealantHeight: string; // Sealant 돌출높이 P/NP
  pouchSealingThickness: number; // μm
  tabSealingThickness: number; // μm
  visualInspection: string; // P/NP
}

export interface SealingSideSealing {
  pouchSealingThickness: number; // μm
  sideBottomSealingWidth: string; // P/NP
  visualInspection: string; // P/NP
  irCheck: string; // P/NP
}

export interface SealingFilling {
  injection: string; // 주액 - 완료 일자
  lot: string; // LOT - 전해액
}

export interface SealingPouch {
  lot: string; // LOT - Pouch
}

export interface SealingData {
  id: number;
  date: string;
  lot: string;
  isDefectiveFromStacking?: boolean;
  isDefectiveFromWelding?: boolean;
  isDefectiveFromSealing?: boolean;
  atAssy: SealingAtAssy;
  topSealing: SealingTopSealing;
  sideSealing: SealingSideSealing;
  filling: SealingFilling;
  pouch: SealingPouch;
}

// Formation 공정 데이터
export interface FormationPreFormation {
  equipment: string; // 설비 - 호기
  chNo: string; // CH No. - 행/열
  pfc: number; // PFC - Ah
  rfd: number; // RFD - Ah
  forEff1: number; // For.EFF_1 - %
}

export interface FormationFinalSealing {
  pouchSealingThickness: number; // μm
  sideBottomSealingWidth: string; // P/NP
  visualInspection: string; // P/NP - 외관
}

export interface FormationMainFormation {
  equipment: string; // 설비 - 호기
  chNo: string; // CH No. - 행/열
  mfc: number; // MFC - Ah
}

export interface FormationOcvIr1 {
  ocv1: number; // OCV1 - V
  ir1: number; // IR1 - mΩ
}

export interface FormationAging4Days {
  ocv2_4: number; // OCV2-4 - V
  ir2_4: number; // IR2-4 - mΩ
}

export interface FormationAging7Days {
  ocv2_7: number; // OCV2-7 - V
  ir2_7: number; // IR2-7 - mΩ
  deltaV: number; // Delta V - V
}

export interface FormationGrading {
  equipment: string; // 설비 - 호기
  chNo: string; // CH No. - 행/열
  mfd: number; // MFD - Ah
  formEff2: number; // Form.EFF_2 - %
  stc: number; // STC - Ah
  std: number; // STD - Ah
  formEff3: number; // Form.EFF_3 - %
  temp: number; // Temp. - °C
  wh: number; // Wh - Wh
  nominalV: number; // Nominal V - V
}

export interface FormationSoc {
  capacity: number; // Capacity - Ah
  soc: number; // SOC - %
  dcIr: number; // DC-IR - mΩ
}

export interface FormationOcvIr3 {
  ocv3: number; // OCV3 - V
  ir3: number; // IR3 - mΩ
}

export interface FormationData {
  id: number;
  date: string;
  assyLot: string;
  formationLot: string;
  preFormation: FormationPreFormation;
  finalSealing: FormationFinalSealing;
  finalLot: string; // 최종 Lot
  mainFormation: FormationMainFormation;
  ocvIr1: FormationOcvIr1;
  aging4Days: FormationAging4Days;
  aging7Days: FormationAging7Days;
  grading: FormationGrading;
  soc: FormationSoc;
  ocvIr3: FormationOcvIr3;
}

