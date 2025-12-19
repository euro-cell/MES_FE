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
