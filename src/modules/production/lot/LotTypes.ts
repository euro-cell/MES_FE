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
