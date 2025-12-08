export interface BinderWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  material1Name?: string;
  material1Composition?: number;
  material1Lot?: string;
  material1PlannedInput?: number;
  material1ActualInput?: number;

  material2Name?: string;
  material2Composition?: number;
  material2Lot?: string;
  material2PlannedInput?: number;
  material2ActualInput?: number;

  binderSolution?: number;
  lot?: string;
  viscosity?: number;

  solidContent1?: number;
  solidContent2?: number;
  solidContent3?: number;

  nmpWeightInput?: number;
  nmpWeightTemp?: number;
  nmpWeightRpmLow?: number;
  nmpWeightRpmHigh?: number;
  nmpWeightStartTime?: string;
  nmpWeightEndTime?: string;

  binderWeightInput?: number;
  binderWeightTemp?: number;
  binderWeightRpmLow?: number;
  binderWeightRpmHigh?: number;
  binderWeightStartTime?: string;
  binderWeightEndTime?: string;

  mixing1Input?: number;
  mixing1Temp?: number;
  mixing1RpmLow?: number;
  mixing1RpmHigh?: number;
  mixing1StartTime?: string;
  mixing1EndTime?: string;

  scrappingInput?: number;
  scrappingTemp?: number;
  scrappingRpmLow?: number;
  scrappingRpmHigh?: number;
  scrappingStartTime?: string;
  scrappingEndTime?: string;

  mixing2Input?: number;
  mixing2Temp?: number;
  mixing2RpmLow?: number;
  mixing2RpmHigh?: number;
  mixing2StartTime?: string;
  mixing2EndTime?: string;

  stabilizationInput?: number;
  stabilizationTemp?: number;
  stabilizationRpmLow?: number;
  stabilizationRpmHigh?: number;
  stabilizationStartTime?: string;
  stabilizationEndTime?: string;
}

export interface BinderWorklogPayload extends Omit<BinderWorklog, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> {}
