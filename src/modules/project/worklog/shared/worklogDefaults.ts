// 작업일지 기본값 LocalStorage 관리

const STORAGE_KEY_PREFIX = 'worklog_defaults_';
const ALL_FIELDS_STORAGE_KEY_PREFIX = 'worklog_all_fields_';

export type ProcessType = 'binder' | 'slurry' | 'coating';

// 각 공정별 저장할 필드 정의
export const PROCESS_DEFAULT_FIELDS: Record<ProcessType, string[]> = {
  binder: ['reviewer', 'approver'],
  slurry: ['reviewer', 'approver'],
  coating: ['reviewer', 'approver'],
};

// 불러오기에서 제외할 필드 (프로젝트별, 날짜별로 다른 값)
const EXCLUDED_FIELDS = ['productionId', 'manufactureDate', 'writer'];

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
    const key = `${ALL_FIELDS_STORAGE_KEY_PREFIX}${processType}`;
    localStorage.setItem(key, JSON.stringify(dataToSave));
  }
}

/**
 * 작업일지 모든 필드 불러오기 (버튼 클릭용)
 */
export function loadWorklogAllFields(processType: ProcessType): Record<string, any> | null {
  const key = `${ALL_FIELDS_STORAGE_KEY_PREFIX}${processType}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
}

/**
 * 저장된 이전 내용이 있는지 확인
 */
export function hasWorklogAllFields(processType: ProcessType): boolean {
  const key = `${ALL_FIELDS_STORAGE_KEY_PREFIX}${processType}`;
  return localStorage.getItem(key) !== null;
}
