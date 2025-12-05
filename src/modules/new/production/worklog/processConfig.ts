import type { ProcessInfo } from './WorklogTypes';

export const PROCESS_CONFIG: Record<string, ProcessInfo[]> = {
  All: [
    { id: 'Binder', category: 'All', title: 'Binder' },
    { id: 'SlurryMixing', category: 'All', title: 'Slurry Mixing' },
    { id: 'Coating', category: 'All', title: 'Coating' },
    { id: 'Press', category: 'All', title: 'Press' },
    { id: 'Notching', category: 'All', title: 'Notching' },
    { id: 'Forming', category: 'All', title: 'Forming' },
    { id: 'VacuumDrying', category: 'All', title: 'Vacuum Drying' },
    { id: 'Stack', category: 'All', title: 'Stack' },
    { id: 'Welding', category: 'All', title: 'Welding' },
    { id: 'Sealing', category: 'All', title: 'Sealing' },
    { id: 'Formation', category: 'All', title: 'Formation' },
    { id: 'Grading', category: 'All', title: 'Grading' },
  ],
};

export const ALL_PROCESSES: ProcessInfo[] = Object.values(PROCESS_CONFIG).flat();

export const getProcessById = (processId: string): ProcessInfo | undefined => {
  return ALL_PROCESSES.find(p => p.id === processId);
};

export const createProcessMenus = (projectId: number) => {
  return ALL_PROCESSES.map(process => ({
    title: process.title,
    path: `/prod/log/${projectId}?process=${process.id}`,
  }));
};
