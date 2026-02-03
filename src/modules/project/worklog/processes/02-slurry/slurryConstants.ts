export const SLURRY_TIME_FIELDS = [
  // PD Mixer 1 (1-7)
  'pdMixer1StartTime1',
  'pdMixer1EndTime1',
  'pdMixer1StartTime2',
  'pdMixer1EndTime2',
  'pdMixer1StartTime3',
  'pdMixer1EndTime3',
  'pdMixer1StartTime4',
  'pdMixer1EndTime4',
  'pdMixer1StartTime5',
  'pdMixer1EndTime5',
  'pdMixer1StartTime6',
  'pdMixer1EndTime6',
  'pdMixer1StartTime7',
  'pdMixer1EndTime7',
  // Viscometer 1
  'viscometer1StartTime',
  'viscometer1EndTime',
  // PD Mixer 2 (1-5)
  'pdMixer2StartTime1',
  'pdMixer2EndTime1',
  'pdMixer2StartTime2',
  'pdMixer2EndTime2',
  'pdMixer2StartTime3',
  'pdMixer2EndTime3',
  'pdMixer2StartTime4',
  'pdMixer2EndTime4',
  'pdMixer2StartTime5',
  'pdMixer2EndTime5',
  // Viscometer 2
  'viscometer2StartTime',
  'viscometer2EndTime',
  // PD Mixer 3
  'pdMixer3StartTime1',
  'pdMixer3EndTime1',
  // Viscometer 3
  'viscometer3StartTime',
  'viscometer3EndTime',
  // PD Mixer 4
  'pdMixer4StartTime1',
  'pdMixer4EndTime1',
];

export const SLURRY_MULTILINE_FIELDS = ['remark'];

// 자동계산 필드 (읽기 전용) - 자재투입정보 필드는 SlurryRegister에서 동적으로 계산
export const SLURRY_READONLY_FIELDS = [
  'productionId',
  'solidContent1Percentage',
  'solidContent2Percentage',
  'solidContent3Percentage',
  'pdMixer1SolidContent1',
  'pdMixer1SolidContent2',
  'pdMixer1SolidContent3',
  'pdMixer1SolidContent4',
  'pdMixer1SolidContent5',
  'pdMixer1SolidContent6',
  'pdMixer1Input1',
  'pdMixer1Input2',
  'pdMixer1Input3',
  'pdMixer1Input4',
  'pdMixer1Input5',
  'pdMixer1Input6',
  'pdMixer2Input1',
  'pdMixer2SolidContent1',
  'solventTotalPlannedInput',
  'solventAddPlannedInput',
];

// 자재투입정보 각 행의 필드 접미사 (동적 readOnly 계산용)
export const MATERIAL_FIELD_SUFFIXES = ['Name', 'Composition', 'Lot', 'PlannedInput', 'ActualInput'];
