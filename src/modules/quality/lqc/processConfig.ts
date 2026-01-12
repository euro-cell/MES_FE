export interface ProcessInfo {
  id: string;
  category: string;
  title: string;
}

export const CATEGORIES = [
  { id: 'Electrode', title: '전극 공정' },
  { id: 'Assembly', title: '조립 공정' },
  { id: 'Formation', title: '화성 공정' },
];

export const PROCESS_CONFIG: Record<string, ProcessInfo[]> = {
  Electrode: [
    { id: 'MixingCathode', category: 'Electrode', title: 'Mixing(Cathode)' },
    { id: 'CoatingCathode', category: 'Electrode', title: 'Coating(Cathode)' },
    { id: 'PressCathode', category: 'Electrode', title: 'Press(Cathode)' },
    { id: 'VDCathode', category: 'Electrode', title: 'VD(Cathode)' },
    { id: 'MixingAnode', category: 'Electrode', title: 'Mixing(Anode)' },
    { id: 'CoatingAnode', category: 'Electrode', title: 'Coating(Anode)' },
    { id: 'PressAnode', category: 'Electrode', title: 'Press(Anode)' },
    { id: 'VDAnode', category: 'Electrode', title: 'VD(Anode)' },
  ],
  Assembly: [],
  Formation: [],
};

export const getProcessesByCategory = (category: string): ProcessInfo[] => {
  return PROCESS_CONFIG[category] || [];
};

export const createCategoryMenus = (projectId: number) => {
  return CATEGORIES.map(category => ({
    title: category.title,
    path: `/quality/lqc/${projectId}?category=${category.id}`,
  }));
};

export const createProcessMenus = (projectId: number, category: string) => {
  const processes = getProcessesByCategory(category);
  return processes.map(process => ({
    title: process.title,
    path: `/quality/lqc/${projectId}?category=${category}&process=${process.id}`,
  }));
};
