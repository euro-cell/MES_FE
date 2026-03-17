export interface ProcessInfo {
  id: string;
  category: string;
  title: string;
  electrode?: 'C' | 'A'; // C: Cathode(양극), A: Anode(음극)
}

export const CATEGORIES = [
  { id: 'Electrode', title: '전극 공정' },
  { id: 'Assembly', title: '조립 공정' },
  { id: 'Formation', title: '화성 공정' },
];

export const PROCESS_CONFIG: Record<string, ProcessInfo[]> = {
  Electrode: [
    { id: 'MixingCathode', category: 'Electrode', title: 'Mixing(Cathode)', electrode: 'C' },
    { id: 'CoatingCathode', category: 'Electrode', title: 'Coating(Cathode)', electrode: 'C' },
    { id: 'PressCathode', category: 'Electrode', title: 'Press(Cathode)', electrode: 'C' },
    { id: 'VDCathode', category: 'Electrode', title: 'VD(Cathode)', electrode: 'C' },
    { id: 'MixingAnode', category: 'Electrode', title: 'Mixing(Anode)', electrode: 'A' },
    { id: 'CoatingAnode', category: 'Electrode', title: 'Coating(Anode)', electrode: 'A' },
    { id: 'PressAnode', category: 'Electrode', title: 'Press(Anode)', electrode: 'A' },
    { id: 'VDAnode', category: 'Electrode', title: 'VD(Anode)', electrode: 'A' },
  ],
  Assembly: [
    { id: 'Sealing', category: 'Assembly', title: 'Sealing' },
    { id: 'FinalSealing', category: 'Assembly', title: 'Final Sealing' },
  ],
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
    electrode: process.electrode,
  }));
};
