/**
 * 공정별 카테고리 매핑
 * 각 공정이 속한 상위 카테고리를 정의
 */

export type ProcessCategory = 'Electrode' | 'Assembly' | 'Formation';
export type CategoryLabel = '전극' | '조립' | '화성';

export const PROCESS_CATEGORY_MAP: Record<string, ProcessCategory> = {
  // 전극 공정
  'Binder': 'Electrode',
  'Slurry': 'Electrode',
  'Coating': 'Electrode',
  'Press': 'Electrode',
  'Notching': 'Electrode',

  // 조립 공정
  'VD': 'Assembly',
  'Forming': 'Assembly',
  'Stacking': 'Assembly',
  'Welding': 'Assembly',
  'Sealing': 'Assembly',
  'Filling': 'Assembly',

  // 화성 공정
  'Formation': 'Formation',
  'Grading': 'Formation',
  'Inspection': 'Formation',
};

/**
 * 카테고리와 한글명 매핑
 */
export const CATEGORY_LABEL_MAP: Record<ProcessCategory, CategoryLabel> = {
  'Electrode': '전극',
  'Assembly': '조립',
  'Formation': '화성',
};

/**
 * 한글명과 카테고리 매핑
 */
export const LABEL_CATEGORY_MAP: Record<CategoryLabel, ProcessCategory> = {
  '전극': 'Electrode',
  '조립': 'Assembly',
  '화성': 'Formation',
};

/**
 * 공정명으로부터 카테고리를 가져오는 헬퍼 함수
 */
export const getProcessCategory = (processName: string): ProcessCategory => {
  return PROCESS_CATEGORY_MAP[processName] || 'Electrode';
};

/**
 * 카테고리를 한글명으로 변환
 */
export const getCategoryLabel = (category: ProcessCategory): CategoryLabel => {
  return CATEGORY_LABEL_MAP[category];
};
