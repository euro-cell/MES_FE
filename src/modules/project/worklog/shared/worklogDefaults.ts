// 작업일지 기본값 LocalStorage 관리

const STORAGE_KEY_PREFIX = 'worklog_defaults_';
const PREVIOUS_STORAGE_KEY_PREFIX = 'worklog_previous_';

export type ProcessType =
  | 'binder'
  | 'slurry'
  | 'coating'
  | 'press'
  | 'notching'
  | 'vd'
  | 'forming'
  | 'stacking'
  | 'welding'
  | 'sealing'
  | 'filling'
  | 'formation'
  | 'grading'
  | 'inspection';

// 각 공정별 자동 저장/불러오기할 필드 정의 (페이지 진입 시 자동 적용)
export const PROCESS_DEFAULT_FIELDS: Record<ProcessType, string[]> = {
  binder: ['reviewer', 'approver', 'jigNumber'],
  slurry: ['reviewer', 'approver', 'jigNumber'],
  coating: [
    'reviewer',
    'approver',
    'jigNumber',
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
    // 코팅 조건
    'coatingConditionSingle',
    'coatingConditionDouble',
  ],
  press: [
    'reviewer',
    'approver',
    'jigNumber',
    // 공정 조건 - 장력
    'tensionUnT',
    'tensionReT',
    // 공정 조건 - 프레스
    'pressSpeed',
    'pressureCondition',
    // 공정 조건 - Roll Gap
    'rollGapLeft',
    'rollGapRight',
    // 공정 조건 - Roll 온도
    'rollTemperatureMain',
    'rollTemperatureInfeed',
  ],
  notching: [
    'reviewer',
    'approver',
    'jigNumber',
    // 공정 조건
    'tension',
    'punchingSpeed',
  ],
  vd: [
    'reviewer',
    'approver',
    'jigNumber',
    // 공정 조건
    'vacuumDegreeSetting',
    'upperSetTemperature',
    'lowerSetTemperature',
    'upperTimerTime',
    'lowerTimerTime',
  ],
  forming: [
    'reviewer',
    'approver',
    'jigNumber',
    // 공정 조건 - 컷팅
    'cuttingLength',
    'cuttingChecklist',
    // 공정 조건 - 포밍
    'formingDepth',
    'formingStopperHeight',
    'formingChecklist',
    // 공정 조건 - 탑컷팅
    'topCuttingLength',
    'topCuttingChecklist',
  ],
  stacking: [
    'reviewer',
    'approver',
    'jigNumber',
    // 공정 조건
    'jellyRollWeight',
    'jellyRollThickness',
    'separatorTopBottomDimension',
    'stackCount',
    'hipotVoltage',
  ],
  welding: [
    'reviewer',
    'approver',
    'jigNumber',
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
  ],
  sealing: [
    'reviewer',
    'approver',
    'jigNumber',
    // 공정 조건 - 탑
    'topTemperature',
    'topPressure',
    'topSealingTime',
    'topChecklist',
    // 공정 조건 - 사이드
    'sideTemperature',
    'sidePressure',
    'sideSealingTime',
    'sideChecklist',
    // 공정 조건 - 바텀
    'bottomTemperature',
    'bottomPressure',
    'bottomSealingTime',
    'bottomChecklist',
    // 공정 조건 - 하이팟
    'hipotVoltage',
    'hipotTime',
  ],
  filling: [
    'reviewer',
    'approver',
    'jigNumber',
    // 공정 조건 - 필링
    'fillingEquipmentInjectionAmount',
    'fillingSpecInjectionAmount',
    'fillingInjectionSpeed',
    'fillingSpecificGravity',
    // 공정 조건 - 웨이팅 구분 1
    'waiting1RepeatCount',
    'waiting1PressureRange',
    'waiting1HoldTime',
    // 공정 조건 - 웨이팅 구분 2
    'waiting2RepeatCount',
    'waiting2PressureRange',
    'waiting2HoldTime',
    // 공정 조건 - 웨이팅 구분 3
    'waiting3RepeatCount',
    'waiting3PressureRange',
    'waiting3HoldTime',
  ],
  formation: [
    'reviewer',
    'approver',
    'jigNumber',
    // 공정 조건 - 프리포메이션
    'preFormationVoltageCondition',
    'preFormationLowerVoltage',
    'preFormationUpperVoltage',
    'preFormationAppliedCurrent',
    'preFormationTemperature',
    // 공정 조건 - 메인포메이션
    'mainFormationVoltageCondition',
    'mainFormationLowerVoltage',
    'mainFormationUpperVoltage',
    'mainFormationAppliedCurrent',
    'mainFormationTemperature',
    // 공정 조건 - 디가스
    'degasVacuumHoldTime',
    'degasVacuumSealingAdhesionTime',
    'degasVacuumDegree',
    // 공정 조건 - OCV1
    'ocv1MeasurementEquipmentName',
    'ocv1VoltageSpec',
  ],
  grading: [
    'reviewer',
    'approver',
    'jigNumber',
    // 공정 조건 - Grading
    'gradingVoltageCondition',
    'gradingLowerVoltage',
    'gradingUpperVoltage',
    'gradingAppliedCurrent',
    'gradingTemperature',
    // 공정 조건 - OCV2
    'ocv2MeasurementEquipmentName',
    'ocv2VoltageSpec',
    // 공정 조건 - OCV3
    'ocv3MeasurementEquipmentName',
    'ocv3VoltageSpec',
  ],
  inspection: ['reviewer', 'approver', 'jigNumber'],
};

// 불러오기에서 제외할 필드 (프로젝트별, 날짜별로 다른 값)
const EXCLUDED_FIELDS = ['projectId', 'manufactureDate', 'writer'];

/**
 * 작업일지 기본값 저장
 */
export function saveWorklogDefaults(processType: ProcessType, values: Record<string, any>): void {
  const fieldsToSave = PROCESS_DEFAULT_FIELDS[processType];
  const dataToSave: Record<string, any> = {};

  fieldsToSave.forEach(field => {
    if (values[field] !== undefined && values[field] !== '') {
      dataToSave[field] = values[field];
    }
  });

  if (Object.keys(dataToSave).length > 0) {
    const key = `${STORAGE_KEY_PREFIX}${processType}`;
    localStorage.setItem(key, JSON.stringify(dataToSave));
  }
}

/**
 * 작업일지 기본값 불러오기
 */
export function loadWorklogDefaults(processType: ProcessType): Record<string, any> | null {
  const key = `${STORAGE_KEY_PREFIX}${processType}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
}

/**
 * 작업일지 모든 필드 저장 (버튼 클릭으로 불러오기용)
 */
export function saveWorklogAllFields(processType: ProcessType, values: Record<string, any>): void {
  const dataToSave: Record<string, any> = {};

  Object.entries(values).forEach(([field, value]) => {
    // 제외할 필드가 아니고 값이 있는 경우만 저장
    if (!EXCLUDED_FIELDS.includes(field) && value !== undefined && value !== '') {
      dataToSave[field] = value;
    }
  });

  if (Object.keys(dataToSave).length > 0) {
    const key = `${PREVIOUS_STORAGE_KEY_PREFIX}${processType}`;
    localStorage.setItem(key, JSON.stringify(dataToSave));
  }
}

/**
 * 작업일지 모든 필드 불러오기 (버튼 클릭용)
 */
export function loadWorklogAllFields(processType: ProcessType): Record<string, any> | null {
  const key = `${PREVIOUS_STORAGE_KEY_PREFIX}${processType}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
}

/**
 * 저장된 이전 내용이 있는지 확인
 */
export function hasWorklogAllFields(processType: ProcessType): boolean {
  const key = `${PREVIOUS_STORAGE_KEY_PREFIX}${processType}`;
  return localStorage.getItem(key) !== null;
}
