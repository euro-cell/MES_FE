// 각 공정별 숫자 필드 목록

// Binder 숫자 필드
export const BINDER_NUMERIC_FIELDS = [
  'material1Composition',
  'material1PlannedInput',
  'material1ActualInput',
  'material2Composition',
  'material2PlannedInput',
  'material2ActualInput',
  'binderSolution',
  'viscosity',
  'solidContent1',
  'solidContent2',
  'solidContent3',
  'nmpWeightInput',
  'nmpWeightTemp',
  'nmpWeightRpmLow',
  'nmpWeightRpmHigh',
  'binderWeightInput',
  'binderWeightTemp',
  'binderWeightRpmLow',
  'binderWeightRpmHigh',
  'mixing1Input',
  'mixing1Temp',
  'mixing1RpmLow',
  'mixing1RpmHigh',
  'scrappingInput',
  'scrappingTemp',
  'scrappingRpmLow',
  'scrappingRpmHigh',
  'mixing2Input',
  'mixing2Temp',
  'mixing2RpmLow',
  'mixing2RpmHigh',
  'stabilizationInput',
  'stabilizationTemp',
  'stabilizationRpmLow',
  'stabilizationRpmHigh',
];

// Slurry 숫자 필드
export const SLURRY_NUMERIC_FIELDS = [
  // 자재 투입 정보 - 원료 1-8
  ...['1', '2', '3', '4', '5', '6', '7', '8'].flatMap(n => [
    `material${n}Composition`,
    `material${n}PlannedInput`,
    `material${n}ActualInput`,
  ]),
  'solidContent',
  // 점도
  'viscosityAfterMixing',
  'viscosityAfterDefoaming',
  'viscosityAfterStabilization',
  'viscosity4Value',
  // 고형분 1-3
  ...['1', '2', '3'].flatMap(n => [
    `solidContent${n}Dish`,
    `solidContent${n}Slurry`,
    `solidContent${n}Dry`,
    `solidContent${n}Percentage`,
  ]),
  // Grind Gage
  'grindGageFineParticle1',
  'grindGageFineParticle2',
  'grindGageLine1',
  'grindGageLine2',
  'grindGageNonCoating1',
  'grindGageNonCoating2',
  // PD Mixer 1 (1-7)
  ...['1', '2', '3', '4', '5', '6', '7'].flatMap(n => [
    `pdMixer1Input${n}`,
    `pdMixer1InputRate${n}`,
    `pdMixer1SolidContent${n}`,
    `pdMixer1Temp${n}`,
    `pdMixer1RpmLow${n}`,
    `pdMixer1RpmHigh${n}`,
  ]),
  // Viscometer 1
  'viscometer1Input',
  'viscometer1InputRate',
  'viscometer1SolidContent',
  'viscometer1Temp',
  'viscometer1RpmLow',
  'viscometer1RpmHigh',
  // PD Mixer 2 (1-5)
  ...['1', '2', '3', '4', '5'].flatMap(n => [
    `pdMixer2Input${n}`,
    `pdMixer2InputRate${n}`,
    `pdMixer2SolidContent${n}`,
    `pdMixer2Temp${n}`,
    `pdMixer2RpmLow${n}`,
    `pdMixer2RpmHigh${n}`,
  ]),
  // Viscometer 2
  'viscometer2Input',
  'viscometer2InputRate',
  'viscometer2SolidContent',
  'viscometer2Temp',
  'viscometer2RpmLow',
  'viscometer2RpmHigh',
  // PD Mixer 3
  'pdMixer3Input1',
  'pdMixer3InputRate1',
  'pdMixer3SolidContent1',
  'pdMixer3Temp1',
  'pdMixer3RpmLow1',
  'pdMixer3RpmHigh1',
  // Viscometer 3
  'viscometer3Input',
  'viscometer3InputRate',
  'viscometer3SolidContent',
  'viscometer3Temp',
  'viscometer3RpmLow',
  'viscometer3RpmHigh',
  // PD Mixer 4
  'pdMixer4Input1',
  'pdMixer4InputRate1',
  'pdMixer4SolidContent1',
  'pdMixer4Temp1',
  'pdMixer4RpmLow1',
  'pdMixer4RpmHigh1',
];

// Coating 숫자 필드
export const COATING_NUMERIC_FIELDS = [
  'inputAmount',
  'usageAmount',
  'solidContent',
  'inputAmountDesign',
  'inputAmountActual',
  // 생산 정보 1~4차
  ...['1', '2', '3', '4'].flatMap(n => [
    `productionQuantity${n}`,
    `monoPumpFront${n}`,
    `monoPumpRear${n}`,
    `coatingSpeedFront${n}`,
    `coatingSpeedRear${n}`,
    `coatingWidth${n}`,
    `misalignment${n}`,
    `weightPerAreaFront${n}M`,
    `weightPerAreaFront${n}C`,
    `weightPerAreaFront${n}D`,
    `weightPerAreaRear${n}M`,
    `weightPerAreaRear${n}C`,
    `weightPerAreaRear${n}D`,
    `thicknessFront${n}M`,
    `thicknessFront${n}C`,
    `thicknessFront${n}D`,
    `thicknessRear${n}M`,
    `thicknessRear${n}C`,
    `thicknessRear${n}D`,
  ]),
  // 건조 조건
  'zone1TempUpper',
  'zone1TempLower',
  'zone2TempUpper',
  'zone2TempLower',
  'zone3Temp',
  'zone4Temp',
  // 공급 풍량
  'zone1SupplyAirflowUpper',
  'zone1SupplyAirflowLower',
  'zone2SupplyAirflowUpper',
  'zone2SupplyAirflowLower',
  'zone3SupplyAirflow',
  'zone4SupplyAirflow',
  // 배기 풍량
  'zone12ExhaustAirflow',
  'zone34ExhaustAirflow',
  'capsuleFilter',
  'coatingSpeed',
  'meshFilter',
  // 장력
  'tensionUnT',
  'tensionOfT',
  'tensionReT',
];

// Press 숫자 필드
export const PRESS_NUMERIC_FIELDS = [
  'targetThickness',
  // 생산 정보 1~5차
  ...['1', '2', '3', '4', '5'].flatMap(n => [
    `coatingQuantity${n}`,
    `pressQuantity${n}`,
    `weightPerAreaFront${n}M`,
    `weightPerAreaFront${n}C`,
    `weightPerAreaFront${n}D`,
    `weightPerAreaRear${n}M`,
    `weightPerAreaRear${n}C`,
    `weightPerAreaRear${n}D`,
    `thicknessFront${n}M`,
    `thicknessFront${n}C`,
    `thicknessFront${n}D`,
    `thicknessRear${n}M`,
    `thicknessRear${n}C`,
    `thicknessRear${n}D`,
  ]),
  // 공정 조건
  'tensionUnT',
  'tensionReT',
  'pressSpeed',
  'pressureCondition',
  'rollGapLeft',
  'rollGapRight',
  'rollTemperatureMain',
  'rollTemperatureInfeed',
];

// Notching 숫자 필드
export const NOTCHING_NUMERIC_FIELDS = [
  // 생산 정보 1~5차
  ...['1', '2', '3', '4', '5'].flatMap(n => [
    `pressQuantity${n}`,
    `notchingQuantity${n}`,
    `defectQuantity${n}`,
    `goodQuantity${n}`,
    `dimension${n}`,
    `burr${n}`,
    `damage${n}`,
    `nonCutting${n}`,
    `overTab${n}`,
    `wide${n}`,
    `length${n}`,
    `missMatch${n}`,
  ]),
  // 공정 조건
  'tension',
  'punchingSpeed',
];

// VD 숫자 필드
export const VD_NUMERIC_FIELDS = [
  // 생산 정보 1~5차
  ...['1', '2', '3', '4', '5'].flatMap(n => [
    `cathodeInputQuantity${n}`,
    `cathodeMoistureMeasurement${n}`,
    `anodeInputQuantity${n}`,
    `anodeMoistureMeasurement${n}`,
  ]),
  // 공정 조건
  'vacuumDegreeSetting',
  'cathodeSetTemperature',
  'anodeSetTemperature',
  'cathodeTimerTime',
  'anodeTimerTime',
];

// Forming 숫자 필드
export const FORMING_NUMERIC_FIELDS = [
  'pouchUsage',
  // 컷팅
  'cuttingWorkQuantity',
  'cuttingGoodQuantity',
  'cuttingDefectQuantity',
  'cuttingDiscardQuantity',
  'cuttingDefectRate',
  // 포밍
  'formingWorkQuantity',
  'formingGoodQuantity',
  'formingDefectQuantity',
  'formingDiscardQuantity',
  'formingDefectRate',
  // 폴딩
  'foldingWorkQuantity',
  'foldingGoodQuantity',
  'foldingDefectQuantity',
  'foldingDiscardQuantity',
  'foldingDefectRate',
  // 탑컷팅
  'topCuttingWorkQuantity',
  'topCuttingGoodQuantity',
  'topCuttingDefectQuantity',
  'topCuttingDiscardQuantity',
  'topCuttingDefectRate',
  // 공정 조건
  'cuttingLength',
  'formingDepth',
  'formingStopperHeight',
  'topCuttingLength',
];

// Stacking 숫자 필드
export const STACKING_NUMERIC_FIELDS = [
  'separatorInputQuantity',
  'separatorUsage',
  // 스택
  'stackActualInput',
  'stackGoodQuantity',
  'stackDefectQuantity',
  'stackDiscardQuantity',
  'stackDefectRate',
  // 하이팟1
  'hipot1ActualInput',
  'hipot1GoodQuantity',
  'hipot1DefectQuantity',
  'hipot1DiscardQuantity',
  'hipot1DefectRate',
  // JR 번호 1~4
  ...['1', '2', '3', '4'].map(n => `jr${n}ElectrodeDefect`),
  // 공정 조건
  'jellyRollWeight',
  'jellyRollThickness',
  'separatorTopBottomDimension',
  'stackCount',
  'hipotVoltage',
];

// Welding 숫자 필드
export const WELDING_NUMERIC_FIELDS = [
  'leadTabUsage',
  'piTapeUsage',
  // 프리웰딩
  'preWeldingWorkQuantity',
  'preWeldingGoodQuantity',
  'preWeldingDefectQuantity',
  'preWeldingDiscardQuantity',
  'preWeldingDefectRate',
  // 메인웰딩
  'mainWeldingWorkQuantity',
  'mainWeldingGoodQuantity',
  'mainWeldingDefectQuantity',
  'mainWeldingDiscardQuantity',
  'mainWeldingDefectRate',
  // 하이팟2
  'hipot2WorkQuantity',
  'hipot2GoodQuantity',
  'hipot2DefectQuantity',
  'hipot2DiscardQuantity',
  'hipot2DefectRate',
  // 테이핑
  'tapingWorkQuantity',
  'tapingGoodQuantity',
  'tapingDefectQuantity',
  'tapingDiscardQuantity',
  'tapingDefectRate',
  // 공정 조건 - 프리웰딩
  'preWeldingEnergy',
  'preWeldingAmplitude',
  'preWeldingStopper',
  'preWeldingPressure',
  'preWeldingHoldTime',
  // 공정 조건 - 메인웰딩
  'mainWeldingEnergy',
  'mainWeldingAmplitude',
  'mainWeldingStopper',
  'mainWeldingPressure',
  'mainWeldingHoldTime',
  // 공정 조건 - 하이팟
  'hipotVoltage',
  'hipotTime',
  // 공정 조건 - 테이핑
  'tapingLength',
];

// Sealing 숫자 필드
export const SEALING_NUMERIC_FIELDS = [
  'pouchDepth',
  // 탑
  'topWorkQuantity',
  'topGoodQuantity',
  'topDefectQuantity',
  'topDiscardQuantity',
  'topDefectRate',
  // 사이드
  'sideWorkQuantity',
  'sideGoodQuantity',
  'sideDefectQuantity',
  'sideDiscardQuantity',
  'sideDefectRate',
  // 하이팟3
  'hipot3WorkQuantity',
  'hipot3GoodQuantity',
  'hipot3DefectQuantity',
  'hipot3DiscardQuantity',
  'hipot3DefectRate',
  // 공정 조건
  'topSealingTime',
  'sideSealingTime',
  'bottomSealingTime',
  'hipotVoltage',
  'hipotTime',
];

// Filling 숫자 필드
export const FILLING_NUMERIC_FIELDS = [
  'electrolyteUsage',
  // 필링
  'fillingWorkQuantity',
  'fillingGoodQuantity',
  'fillingDefectQuantity',
  'fillingDiscardQuantity',
  'fillingDefectRate',
  // 웨이팅
  'waitingWorkQuantity',
  'waitingGoodQuantity',
  'waitingDefectQuantity',
  'waitingDiscardQuantity',
  'waitingDefectRate',
  // 공정 조건 - 필링
  'fillingEquipmentInjectionAmount',
  'fillingSpecInjectionAmount',
  'fillingInjectionSpeed',
  'fillingSpecificGravity',
  // 공정 조건 - 웨이팅
  'waiting1RepeatCount',
  'waiting1HoldTime',
  'waiting2RepeatCount',
  'waiting2HoldTime',
  'waiting3RepeatCount',
  'waiting3HoldTime',
];

// Formation 숫자 필드
export const FORMATION_NUMERIC_FIELDS = [
  // 디가스1
  'degas1InputQuantity',
  'degas1GoodQuantity',
  'degas1DefectQuantity',
  'degas1DiscardQuantity',
  'degas1DefectRate',
  // 프리포메이션
  'preFormationInputQuantity',
  'preFormationGoodQuantity',
  'preFormationDefectQuantity',
  'preFormationDiscardQuantity',
  'preFormationDefectRate',
  // 프리포메이션 호기 1~5
  ...['1', '2', '3', '4', '5'].map(n => `preFormation${n}Quantity`),
  // 디가스2
  'degas2InputQuantity',
  'degas2GoodQuantity',
  'degas2DefectQuantity',
  'degas2DiscardQuantity',
  'degas2DefectRate',
  // 셀 프레스
  'cellPressInputQuantity',
  'cellPressGoodQuantity',
  'cellPressDefectQuantity',
  'cellPressDiscardQuantity',
  'cellPressDefectRate',
  // 파이널 실링
  'finalSealingInputQuantity',
  'finalSealingGoodQuantity',
  'finalSealingDefectQuantity',
  'finalSealingDiscardQuantity',
  'finalSealingDefectRate',
  // 실링 두께 1~5
  'sealingThickness1',
  'sealingThickness2',
  'sealingThickness3',
  'sealingThickness4',
  'sealingThickness5',
  // lot 마킹
  'lotMarkingInputQuantity',
  'lotMarkingGoodQuantity',
  'lotMarkingDefectQuantity',
  'lotMarkingDiscardQuantity',
  'lotMarkingDefectRate',
  // 메인포메이션
  'mainFormationInputQuantity',
  'mainFormationGoodQuantity',
  'mainFormationDefectQuantity',
  'mainFormationDiscardQuantity',
  'mainFormationDefectRate',
  // 메인포메이션 호기 1~5
  ...['1', '2', '3', '4', '5'].map(n => `mainFormation${n}Quantity`),
  // OCV1
  'ocv1Quantity',
  // 공정 조건 - 프리포메이션
  'preFormationLowerVoltage',
  'preFormationUpperVoltage',
  'preFormationAppliedCurrent',
  'preFormationTemperature',
  // 공정 조건 - 메인포메이션
  'mainFormationLowerVoltage',
  'mainFormationUpperVoltage',
  'mainFormationAppliedCurrent',
  'mainFormationTemperature',
  // 공정 조건 - 디가스
  'degasVacuumHoldTime',
  'degasVacuumDegree',
];

// Grading 숫자 필드
export const GRADING_NUMERIC_FIELDS = [
  // OCV2
  'ocv2InputQuantity',
  'ocv2GoodQuantity',
  'ocv2DefectQuantity',
  'ocv2DiscardQuantity',
  'ocv2DefectRate',
  // OCV3
  'ocv3InputQuantity',
  'ocv3GoodQuantity',
  'ocv3DefectQuantity',
  'ocv3DiscardQuantity',
  'ocv3DefectRate',
  // IR
  'irInputQuantity',
  'irGoodQuantity',
  'irDefectQuantity',
  'irDiscardQuantity',
  'irDefectRate',
  // HiPot
  'hipotInputQuantity',
  'hipotGoodQuantity',
  'hipotDefectQuantity',
  'hipotDiscardQuantity',
  'hipotDefectRate',
  // Grading
  'gradingInputQuantity',
  'gradingGoodQuantity',
  'gradingDefectQuantity',
  'gradingDiscardQuantity',
  'gradingDefectRate',
  // 공정 조건 - OCV2
  'ocv2MeasurementTemp',
  'ocv2SettlingTime',
  // 공정 조건 - IR
  'irMeasurementFreq',
  'irMeasurementTemp',
  // 공정 조건 - HiPot
  'hipotTestTime',
  'hipotLeakageCurrent',
];

// Inspection 숫자 필드
export const INSPECTION_NUMERIC_FIELDS = [
  // 셀 입력
  'cellInputQuantity',
  // 가스 발생
  'gasInputQuantity',
  'gasGoodQuantity',
  'gasDefectQuantity',
  'gasDiscardQuantity',
  'gasDefectRate',
  // 이물질 외관
  'foreignMatterInputQuantity',
  'foreignMatterGoodQuantity',
  'foreignMatterDefectQuantity',
  'foreignMatterDiscardQuantity',
  'foreignMatterDefectRate',
  // 긁힘
  'scratchInputQuantity',
  'scratchGoodQuantity',
  'scratchDefectQuantity',
  'scratchDiscardQuantity',
  'scratchDefectRate',
  // 찍힘
  'dentInputQuantity',
  'dentGoodQuantity',
  'dentDefectQuantity',
  'dentDiscardQuantity',
  'dentDefectRate',
  // 누액 및 부식
  'leakCorrosionInputQuantity',
  'leakCorrosionGoodQuantity',
  'leakCorrosionDefectQuantity',
  'leakCorrosionDiscardQuantity',
  'leakCorrosionDefectRate',
  // 전지 크기
  'cellSizeInputQuantity',
  'cellSizeGoodQuantity',
  'cellSizeDefectQuantity',
  'cellSizeDiscardQuantity',
  'cellSizeDefectRate',
];
