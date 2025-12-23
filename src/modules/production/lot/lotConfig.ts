import type { ProcessInfo, CategoryInfo } from './LotTypes';

export const LOT_PROCESS_CONFIG: Record<string, ProcessInfo[]> = {
  Electrode: [
    { id: 'Mixing', title: 'Mixing' },
    { id: 'Coating', title: 'Coating' },
    { id: 'Calendering', title: 'Calendering' },
    { id: 'Slitting', title: 'Slitting' },
    { id: 'Notching', title: 'Notching' },
  ],
  Assembly: [
    { id: 'Stacking', title: 'Stacking' },
    { id: 'Welding', title: 'Welding' },
    { id: 'Sealing', title: 'Sealing/Filling' },
  ],
  Formation: [
    { id: 'Formation', title: 'Formation' },
  ],
};

export const LOT_CATEGORIES: CategoryInfo[] = [
  { id: 'Electrode', title: '전극 공정' },
  { id: 'Assembly', title: '조립 공정' },
  { id: 'Formation', title: '화성 공정' },
];

export const createCategoryMenus = (projectId: number) => {
  return LOT_CATEGORIES.map(category => ({
    title: category.title,
    path: `/prod/lot/${projectId}?category=${category.id}`,
  }));
};

export const createProcessMenus = (projectId: number, category: string) => {
  const processes = LOT_PROCESS_CONFIG[category] || [];
  return processes.map(process => ({
    title: process.title,
    path: `/prod/lot/${projectId}?category=${category}&process=${process.id}`,
  }));
};

export const getProcessById = (category: string, processId: string): ProcessInfo | undefined => {
  const processes = LOT_PROCESS_CONFIG[category] || [];
  return processes.find(p => p.id === processId);
};
