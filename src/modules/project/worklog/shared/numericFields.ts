// 각 공정별 숫자 필드 목록

// Binder 정수형 필드 (RPM, 점도 등)
export const BINDER_INTEGER_FIELDS = [
  'viscosity',
  'nmpWeightRpmLow',
  'nmpWeightRpmHigh',
  'binderWeightRpmLow',
  'binderWeightRpmHigh',
  'mixing1RpmLow',
  'mixing1RpmHigh',
  'scrappingRpmLow',
  'scrappingRpmHigh',
  'mixing2RpmLow',
  'mixing2RpmHigh',
  'stabilizationRpmLow',
  'stabilizationRpmHigh',
];

// Binder 숫자 필드 (실수형) - 정수형 필드 제외
export const BINDER_NUMERIC_FIELDS = [
  'material1Composition',
  'material1PlannedInput',
  'material1ActualInput',
  'material2Composition',
  'material2PlannedInput',
  'material2ActualInput',
  'binderSolution',
  'solidContent1',
  'solidContent2',
  'solidContent3',
  'nmpWeightInput',
  'nmpWeightTemp',
  'binderWeightInput',
  'binderWeightTemp',
  'mixing1Input',
  'mixing1Temp',
  'scrappingInput',
  'scrappingTemp',
  'mixing2Input',
  'mixing2Temp',
  'stabilizationInput',
  'stabilizationTemp',
];

// Slurry 숫자 필드
export const SLURRY_NUMERIC_FIELDS = [
  // 자재 투입 정보 - 원료 1-6
  ...['1', '2', '3', '4', '5', '6'].flatMap(n => [
    `material${n}Composition`,
    `material${n}PlannedInput`,
    `material${n}ActualInput`,
  ]),
  // 바인더용액 (Binder Solution)
  'binderSolutionComposition',
  'binderSolutionPlannedInput',
  'binderSolutionActualInput',
  // 용매 (Solvent)
  'solventAddPlannedInput',
  'solventAddActualInput',
  'solventTotalPlannedInput',
  'solventTotalActualInput',
  // Solid Content & Binder Solution
  'solidContent',
  'binderSolution',
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

// Coating 소수점 필드 (소수점 첫째자리)
export const COATING_NUMERIC_FIELDS = [
  'inputAmount',
  'usageAmount',
  'solidContent',
  'inputAmountDesign',
  'inputAmountActual',
  // 생산 정보 1~4차 - 소수점 필드 (전단/후단, 코팅폭, 무지부)
  ...['1', '2', '3', '4'].flatMap(n => [
    `monoPumpFront${n}`,
    `monoPumpRear${n}`,
    `coatingSpeedFront${n}`,
    `coatingSpeedRear${n}`,
    `coatingWidth${n}`,
    `uncoatedWidth${n}`,
    `misalignment${n}`,
    `weightPerAreaFront${n}M`,
    `weightPerAreaFront${n}C`,
    `weightPerAreaFront${n}D`,
    `weightPerAreaRear${n}M`,
    `weightPerAreaRear${n}C`,
    `weightPerAreaRear${n}D`,
  ]),
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
  'coatingSpeed',
  // 코팅 조건 (면적밀도)
  'coatingConditionSingle',
  'coatingConditionDouble',
];

// Coating 정수 필드
export const COATING_INTEGER_FIELDS = [
  // 생산 정보 1~4차 - 정수 필드 (생산량, 두께)
  ...['1', '2', '3', '4'].flatMap(n => [
    `productionQuantity${n}`,
    `thicknessFront${n}M`,
    `thicknessFront${n}C`,
    `thicknessFront${n}D`,
    `thicknessRear${n}M`,
    `thicknessRear${n}C`,
    `thicknessRear${n}D`,
  ]),
  // 건조 조건 (온도 - 정수)
  'zone1TempUpper',
  'zone1TempLower',
  'zone2TempUpper',
  'zone2TempLower',
  'zone3Temp',
  'zone4Temp',
  // 필터 (정수)
  'capsuleFilter',
  'meshFilter',
  // 장력 (정수)
  'tensionUnT',
  'tensionOfT',
  'tensionReT',
];

// Press 소수점 필드 (소수점 2자리 - 면적밀도)
export const PRESS_NUMERIC_FIELDS = [
  // 생산 정보 1~5차 - 면적밀도
  ...['1', '2', '3', '4', '5'].flatMap(n => [
    `weightPerAreaFront${n}M`,
    `weightPerAreaFront${n}C`,
    `weightPerAreaFront${n}D`,
    `weightPerAreaRear${n}M`,
    `weightPerAreaRear${n}C`,
    `weightPerAreaRear${n}D`,
  ]),
];

// Press 정수 필드 (두께, 투입량, 생산량, 장력, 프레스 속도, 선압 조건, 롤 온도)
export const PRESS_INTEGER_FIELDS = [
  'targetThickness',
  // 생산 정보 1~5차 - 투입량, 생산량, 두께
  ...['1', '2', '3', '4', '5'].flatMap(n => [
    `coatingQuantity${n}`,
    `pressQuantity${n}`,
    `thicknessFront${n}M`,
    `thicknessFront${n}C`,
    `thicknessFront${n}D`,
    `thicknessRear${n}M`,
    `thicknessRear${n}C`,
    `thicknessRear${n}D`,
  ]),
  // 공정 조건 - 장력, 프레스 속도, 선압 조건, 롤 온도
  'tensionUnT',
  'tensionReT',
  'pressSpeed',
  'pressureCondition',
  'rollGapLeft',
  'rollGapRight',
  'rollTemperatureMain',
  'rollTemperatureInfeed',
];

// Notching 소수점 필드 (소수점 1자리 - 치수 정보)
export const NOTCHING_NUMERIC_FIELDS = [
  // 생산 정보 1~5차 - 치수 정보 4가지
  ...['1', '2', '3', '4', '5'].flatMap(n => [
    `dimension${n}`,
    `wide${n}`,
    `length${n}`,
    `missMatch${n}`,
  ]),
];

// Notching 정수 필드 (수량, 불량 수량, 불량 상세, 공정 조건)
export const NOTCHING_INTEGER_FIELDS = [
  // 생산 정보 1~5차 - 수량
  ...['1', '2', '3', '4', '5'].flatMap(n => [
    `pressQuantity${n}`,
    `notchingQuantity${n}`,
    `defectQuantity${n}`,
    `goodQuantity${n}`,
    // 불량 상세
    `burr${n}`,
    `damage${n}`,
    `nonCutting${n}`,
    `overTab${n}`,
  ]),
  // 공정 조건
  'tension',
  'punchingSpeed',
];

// VD 숫자 필드 (수분측정, 공정 조건)
export const VD_NUMERIC_FIELDS = [
  // 생산 정보 1~5차 - 수분측정
  ...['1', '2', '3', '4', '5'].flatMap(n => [
    `upperMoistureMeasurement${n}`,
    `lowerMoistureMeasurement${n}`,
  ]),
  // 공정 조건
  'vacuumDegreeSetting',
  'upperSetTemperature',
  'lowerSetTemperature',
];

// VD 시간 필드 (타이머 시간 - HH:mm)
export const VD_TIME_FIELDS = [
  'upperTimerTime',
  'lowerTimerTime',
];

// VD 정수 필드 (투입량)
export const VD_INTEGER_FIELDS = [
  // 생산 정보 1~5차 - 투입량
  ...['1', '2', '3', '4', '5'].flatMap(n => [
    `upperInputQuantity${n}`,
    `lowerInputQuantity${n}`,
  ]),
];

// Forming 숫자 필드 (공정 조건)
export const FORMING_NUMERIC_FIELDS = [
  // 공정 조건
  'cuttingLength',
  'formingDepth',
  'formingStopperHeight',
  'topCuttingLength',
];

// Forming 정수 필드 (수량) - 양품 수량은 자동계산이므로 제외
export const FORMING_INTEGER_FIELDS = [
  'pouchUsage',
  // 컷팅
  'cuttingWorkQuantity',
  'cuttingDefectQuantity',
  'cuttingDiscardQuantity',
  // 포밍
  'formingWorkQuantity',
  'formingDefectQuantity',
  'formingDiscardQuantity',
  // 폴딩
  'foldingWorkQuantity',
  'foldingDefectQuantity',
  'foldingDiscardQuantity',
  // 탑컷팅
  'topCuttingWorkQuantity',
  'topCuttingDefectQuantity',
  'topCuttingDiscardQuantity',
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
  'grading1Quantity',
  'grading2Quantity',
  'grading3Quantity',
  'grading4Quantity',
  'grading5Quantity',
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
