import type { ProcessInfo } from './WorklogTypes';

export const PROCESS_CONFIG: Record<string, ProcessInfo[]> = {
  Electrode: [
    { id: 'Binder', category: 'Electrode', title: 'Binder' },
    { id: 'Slurry', category: 'Electrode', title: 'Slurry Mixing' },
    { id: 'Coating', category: 'Electrode', title: 'Coating' },
    { id: 'Press', category: 'Electrode', title: 'Press' },
    { id: 'Slitting', category: 'Electrode', title: 'Slitting' },
    { id: 'Notching', category: 'Electrode', title: 'Notching' },
  ],
  Assembly: [
    { id: 'Forming', category: 'Assembly', title: 'Forming' },
    { id: 'VacuumDrying', category: 'Assembly', title: 'Vacuum Drying' },
    { id: 'Stack', category: 'Assembly', title: 'Stack' },
    { id: 'Welding', category: 'Assembly', title: 'Welding' },
    { id: 'Sealing', category: 'Assembly', title: 'Sealing' },
    { id: 'ELFilling', category: 'Assembly', title: 'E/L Filling' },
  ],
  Formation: [
    { id: 'Formation', category: 'Formation', title: 'Formation' },
    { id: 'Grading', category: 'Formation', title: 'Grading' },
  ],
};

export const CATEGORIES = [
  { id: 'Electrode', title: '전극 공정' },
  { id: 'Assembly', title: '조립 공정' },
  { id: 'Formation', title: '화성 공정' },
];

export const ALL_PROCESSES: ProcessInfo[] = Object.values(PROCESS_CONFIG).flat();

export const getProcessById = (processId: string): ProcessInfo | undefined => {
  return ALL_PROCESSES.find(p => p.id === processId);
};

export const getProcessesByCategory = (category: string): ProcessInfo[] => {
  return PROCESS_CONFIG[category] || [];
};

export const createCategoryMenus = (projectId: number) => {
  return CATEGORIES.map(category => ({
    title: category.title,
    path: `/prod/log/${projectId}?category=${category.id}`,
  }));
};

export const createProcessMenus = (projectId: number, category: string) => {
  const processes = getProcessesByCategory(category);
  return processes.map(process => ({
    title: process.title,
    path: `/prod/log/${projectId}?category=${category}&process=${process.id}`,
  }));
};
