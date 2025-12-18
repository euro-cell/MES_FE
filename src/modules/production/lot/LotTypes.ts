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

// Mixing 공정 데이터
export interface MixingData {
  id: number;
  mixingDate: string;
  projectName: string;
  lotNumber: string;
  temp: number;
  humidity: number;
  activeMaterial: number;
  viscosityAfterMixing: number;
  viscosityAfterDefoam: number;
  viscosityAfterStable: number;
  grindGage: string;
  solidContent1: number;
  solidContent2: number;
  solidContent3: number;
  binderViscosity: number | null;
  binderSolidContent1: number;
  binderSolidContent2: number;
  binderSolidContent3: number | null;
}
