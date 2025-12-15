import { getMonthsBetween, formatMonthLabel } from './utils/dateUtils';
import type { ProcessInfo } from '../worklog/WorklogTypes';

// 생산 현황 페이지 전용 공정 설정
export const STATUS_PROCESS_CONFIG: Record<string, ProcessInfo[]> = {
  Electrode: [
    { id: 'Mixing', category: 'Electrode', title: 'Mixing' },
    { id: 'CoatingSingle', category: 'Electrode', title: 'Coating Single' },
    { id: 'CoatingDouble', category: 'Electrode', title: 'Coating Double' },
    { id: 'Press', category: 'Electrode', title: 'Press' },
    { id: 'Slitting', category: 'Electrode', title: 'Slitting' },
    { id: 'Notching', category: 'Electrode', title: 'Notching' },
  ],
  Assembly: [
    { id: 'VD', category: 'Assembly', title: 'V/D' },
    { id: 'Forming', category: 'Assembly', title: 'Forming' },
    { id: 'Stack', category: 'Assembly', title: 'Stack' },
    { id: 'PreWelding', category: 'Assembly', title: 'Pre Welding' },
    { id: 'MainWelding', category: 'Assembly', title: 'Main Welding' },
    { id: 'Sealing', category: 'Assembly', title: 'Sealing' },
    { id: 'Filling', category: 'Assembly', title: 'E/L Filling' },
  ],
  Formation: [
    { id: 'PreFormation', category: 'Formation', title: 'Pre Formation' },
    { id: 'Degass', category: 'Formation', title: 'Degass' },
    { id: 'MainFormation', category: 'Formation', title: 'Main Formation OCV/IR_1' },
    { id: 'Aging', category: 'Formation', title: 'Aging OCV/IR_2' },
    { id: 'Grading', category: 'Formation', title: 'Grading OCV/IR_3' },
    { id: 'Inspection', category: 'Formation', title: '외관검사' },
  ],
};

export const CATEGORIES = [
  { id: 'Electrode', title: '전극 공정' },
  { id: 'Assembly', title: '조립 공정' },
  { id: 'Formation', title: '화성 공정' },
];

export const getProcessesByCategory = (category: string): ProcessInfo[] => {
  return STATUS_PROCESS_CONFIG[category] || [];
};

// 양극/음극 선택 메뉴 (전극 공정 전용)
export const ELECTRODE_TYPES = [
  { id: 'cathode', title: '양극' },
  { id: 'anode', title: '음극' },
];

// 카테고리 메뉴 생성
export function createCategoryMenus(projectId: number) {
  const CATEGORIES = [
    { id: 'Electrode', title: '전극 공정' },
    { id: 'Assembly', title: '조립 공정' },
    { id: 'Formation', title: '화성 공정' },
  ];

  return CATEGORIES.map(cat => ({
    title: cat.title,
    path: `/prod/status/${projectId}?category=${cat.id}`,
  }));
}

// 월 메뉴 생성에 필요한 프로젝트 정보 타입
interface ProjectForMonthMenu {
  plan?: {
    startDate: string;
    endDate?: string;
  };
}

// 월 메뉴 생성
export function createMonthMenus(projectId: number, category: string, project: ProjectForMonthMenu | null) {
  console.log('🔍 createMonthMenus 호출:', { projectId, category, project, plan: project?.plan });

  if (!project?.plan?.startDate) {
    console.warn('⚠️ plan.startDate가 없습니다. 월 메뉴를 생성할 수 없습니다.');
    return [];
  }

  const months = getMonthsBetween(project.plan.startDate, project.plan.endDate || new Date().toISOString());
  console.log('📅 생성된 월 목록:', months);

  return months.map((m, idx) => {
    const previousYear = idx > 0 ? months[idx - 1].year : undefined;
    const title = formatMonthLabel(m.year, m.month, previousYear);
    const monthStr = `${m.year}-${String(m.month).padStart(2, '0')}`;

    return {
      title,
      path: `/prod/status/${projectId}?category=${category}&month=${monthStr}`,
    };
  });
}

// 양극/음극 메뉴 생성 (전극 전용 - 월 선택 후)
export function createElectrodeTypeMenus(projectId: number, monthParam: string) {
  return ELECTRODE_TYPES.map(type => ({
    title: type.title,
    path: `/prod/status/${projectId}?category=Electrode&month=${monthParam}&type=${type.id}`,
  }));
}
