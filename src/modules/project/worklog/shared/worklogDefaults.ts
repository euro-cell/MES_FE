// 작업일지 기본값 LocalStorage 관리

const STORAGE_KEY_PREFIX = 'worklog_defaults_';

export type ProcessType = 'binder' | 'slurry' | 'coating';

// 각 공정별 저장할 필드 정의
export const PROCESS_DEFAULT_FIELDS: Record<ProcessType, string[]> = {
  binder: ['reviewer', 'approver'],
  slurry: ['reviewer', 'approver'],
  coating: ['reviewer', 'approver'],
};

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
