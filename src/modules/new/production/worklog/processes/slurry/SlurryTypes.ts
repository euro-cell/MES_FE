export interface SlurryWorklog {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  writer: string;
  createdAt: string;
  updatedAt: string;

  // 자재 투입 정보 - 원료 1-8
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

  material3Name?: string;
  material3Composition?: number;
  material3Lot?: string;
  material3PlannedInput?: number;
  material3ActualInput?: number;

  material4Name?: string;
  material4Composition?: number;
  material4Lot?: string;
  material4PlannedInput?: number;
  material4ActualInput?: number;

  material5Name?: string;
  material5Composition?: number;
  material5Lot?: string;
  material5PlannedInput?: number;
  material5ActualInput?: number;

  material6Name?: string;
  material6Composition?: number;
  material6Lot?: string;
  material6PlannedInput?: number;
  material6ActualInput?: number;

  material7Name?: string;
  material7Composition?: number;
  material7Lot?: string;
  material7PlannedInput?: number;
  material7ActualInput?: number;

  material8Name?: string;
  material8Composition?: number;
  material8Lot?: string;
  material8PlannedInput?: number;
  material8ActualInput?: number;

  // Solid Content
  solidContent?: number;

  // 생산 정보
  lot?: string;

  // 점도
  viscosityAfterMixing?: number;
  viscosityAfterDefoaming?: number;
  viscosityAfterStabilization?: number;
  viscosity4Label?: string;
  viscosity4Value?: number;

  // 고형분 1-3
  solidContent1Dish?: number;
  solidContent1Slurry?: number;
  solidContent1Dry?: number;
  solidContent1Percentage?: number;

  solidContent2Dish?: number;
  solidContent2Slurry?: number;
  solidContent2Dry?: number;
  solidContent2Percentage?: number;

  solidContent3Dish?: number;
  solidContent3Slurry?: number;
  solidContent3Dry?: number;
  solidContent3Percentage?: number;

  // Grind Gage - 미세입자
  grindGageFineParticle1?: number;
  grindGageFineParticle2?: number;

  // Grind Gage - Line
  grindGageLine1?: number;
  grindGageLine2?: number;

  // Grind Gage - 논코팅
  grindGageNonCoating1?: number;
  grindGageNonCoating2?: number;

  // PD Mixer 1 (1-7)
  pdMixer1Name?: string;
  pdMixer1Input1?: number;
  pdMixer1InputRate1?: number;
  pdMixer1SolidContent1?: number;
  pdMixer1Temp1?: number;
  pdMixer1RpmLow1?: number;
  pdMixer1RpmHigh1?: number;
  pdMixer1StartTime1?: string;
  pdMixer1EndTime1?: string;

  pdMixer1Input2?: number;
  pdMixer1InputRate2?: number;
  pdMixer1SolidContent2?: number;
  pdMixer1Temp2?: number;
  pdMixer1RpmLow2?: number;
  pdMixer1RpmHigh2?: number;
  pdMixer1StartTime2?: string;
  pdMixer1EndTime2?: string;

  pdMixer1Input3?: number;
  pdMixer1InputRate3?: number;
  pdMixer1SolidContent3?: number;
  pdMixer1Temp3?: number;
  pdMixer1RpmLow3?: number;
  pdMixer1RpmHigh3?: number;
  pdMixer1StartTime3?: string;
  pdMixer1EndTime3?: string;

  pdMixer1Input4?: number;
  pdMixer1InputRate4?: number;
  pdMixer1SolidContent4?: number;
  pdMixer1Temp4?: number;
  pdMixer1RpmLow4?: number;
  pdMixer1RpmHigh4?: number;
  pdMixer1StartTime4?: string;
  pdMixer1EndTime4?: string;

  pdMixer1Input5?: number;
  pdMixer1InputRate5?: number;
  pdMixer1SolidContent5?: number;
  pdMixer1Temp5?: number;
  pdMixer1RpmLow5?: number;
  pdMixer1RpmHigh5?: number;
  pdMixer1StartTime5?: string;
  pdMixer1EndTime5?: string;

  pdMixer1Input6?: number;
  pdMixer1InputRate6?: number;
  pdMixer1SolidContent6?: number;
  pdMixer1Temp6?: number;
  pdMixer1RpmLow6?: number;
  pdMixer1RpmHigh6?: number;
  pdMixer1StartTime6?: string;
  pdMixer1EndTime6?: string;

  pdMixer1Input7?: number;
  pdMixer1InputRate7?: number;
  pdMixer1SolidContent7?: number;
  pdMixer1Temp7?: number;
  pdMixer1RpmLow7?: number;
  pdMixer1RpmHigh7?: number;
  pdMixer1StartTime7?: string;
  pdMixer1EndTime7?: string;

  // Viscometer 1
  viscometer1Input?: number;
  viscometer1InputRate?: number;
  viscometer1SolidContent?: number;
  viscometer1Temp?: number;
  viscometer1RpmLow?: number;
  viscometer1RpmHigh?: number;
  viscometer1StartTime?: string;
  viscometer1EndTime?: string;

  // PD Mixer 2 (1-5)
  pdMixer2Name?: string;
  pdMixer2Input1?: number;
  pdMixer2InputRate1?: number;
  pdMixer2SolidContent1?: number;
  pdMixer2Temp1?: number;
  pdMixer2RpmLow1?: number;
  pdMixer2RpmHigh1?: number;
  pdMixer2StartTime1?: string;
  pdMixer2EndTime1?: string;

  pdMixer2Input2?: number;
  pdMixer2InputRate2?: number;
  pdMixer2SolidContent2?: number;
  pdMixer2Temp2?: number;
  pdMixer2RpmLow2?: number;
  pdMixer2RpmHigh2?: number;
  pdMixer2StartTime2?: string;
  pdMixer2EndTime2?: string;

  pdMixer2Input3?: number;
  pdMixer2InputRate3?: number;
  pdMixer2SolidContent3?: number;
  pdMixer2Temp3?: number;
  pdMixer2RpmLow3?: number;
  pdMixer2RpmHigh3?: number;
  pdMixer2StartTime3?: string;
  pdMixer2EndTime3?: string;

  pdMixer2Input4?: number;
  pdMixer2InputRate4?: number;
  pdMixer2SolidContent4?: number;
  pdMixer2Temp4?: number;
  pdMixer2RpmLow4?: number;
  pdMixer2RpmHigh4?: number;
  pdMixer2StartTime4?: string;
  pdMixer2EndTime4?: string;

  pdMixer2Input5?: number;
  pdMixer2InputRate5?: number;
  pdMixer2SolidContent5?: number;
  pdMixer2Temp5?: number;
  pdMixer2RpmLow5?: number;
  pdMixer2RpmHigh5?: number;
  pdMixer2StartTime5?: string;
  pdMixer2EndTime5?: string;

  // Viscometer 2
  viscometer2Input?: number;
  viscometer2InputRate?: number;
  viscometer2SolidContent?: number;
  viscometer2Temp?: number;
  viscometer2RpmLow?: number;
  viscometer2RpmHigh?: number;
  viscometer2StartTime?: string;
  viscometer2EndTime?: string;

  // PD Mixer 3
  pdMixer3Name?: string;
  pdMixer3Input1?: number;
  pdMixer3InputRate1?: number;
  pdMixer3SolidContent1?: number;
  pdMixer3Temp1?: number;
  pdMixer3RpmLow1?: number;
  pdMixer3RpmHigh1?: number;
  pdMixer3StartTime1?: string;
  pdMixer3EndTime1?: string;

  // Viscometer 3
  viscometer3Input?: number;
  viscometer3InputRate?: number;
  viscometer3SolidContent?: number;
  viscometer3Temp?: number;
  viscometer3RpmLow?: number;
  viscometer3RpmHigh?: number;
  viscometer3StartTime?: string;
  viscometer3EndTime?: string;

  // PD Mixer 4
  pdMixer4Name?: string;
  pdMixer4Input1?: number;
  pdMixer4InputRate1?: number;
  pdMixer4SolidContent1?: number;
  pdMixer4Temp1?: number;
  pdMixer4RpmLow1?: number;
  pdMixer4RpmHigh1?: number;
  pdMixer4StartTime1?: string;
  pdMixer4EndTime1?: string;
}

export interface SlurryWorklogPayload extends Omit<SlurryWorklog, 'id' | 'createdAt' | 'updatedAt' | 'writer'> {}
