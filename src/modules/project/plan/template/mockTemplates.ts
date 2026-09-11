import type { ProcessTemplate } from '../PlanTypes';

/**
 * 백엔드 API 연동 전까지 사용하는 임시 데이터.
 * API 완성 후 이 파일과 mock 기반 함수들을 axios 호출로 교체.
 */
export const MOCK_TEMPLATES: ProcessTemplate[] = [
  {
    id: 1,
    name: '파우치형 표준',
    formFactor: '파우치형',
    updatedAt: '2026-08-01',
    items: [
      { id: 1, group: 'Electrode', name: 'Slurry Mixing', types: ['Cathode', 'Anode'], order: 1 },
      { id: 2, group: 'Electrode', name: 'Coating', types: ['Cathode', 'Anode'], order: 2 },
      { id: 3, group: 'Electrode', name: 'Calendering', types: ['Cathode', 'Anode'], order: 3 },
      { id: 4, group: 'Electrode', name: 'Notching', types: ['Cathode', 'Anode'], order: 4 },
      { id: 5, group: 'Cell Assembly', name: 'Pouch Forming', types: [], order: 5 },
      { id: 6, group: 'Cell Assembly', name: 'Vacuum Drying', types: ['Cathode', 'Anode'], order: 6 },
      { id: 7, group: 'Cell Assembly', name: 'Stacking', types: [], order: 7 },
      { id: 8, group: 'Cell Assembly', name: 'Tab Welding', types: [], order: 8 },
      { id: 9, group: 'Cell Assembly', name: 'Sealing', types: [], order: 9 },
      { id: 10, group: 'Cell Assembly', name: 'E/L Filling', types: [], order: 10 },
      { id: 11, group: 'Cell Formation', name: 'PF/MF', types: [], order: 11 },
      { id: 12, group: 'Cell Formation', name: 'Grading', types: [], order: 12 },
    ],
  },
  {
    id: 2,
    name: '원통형 표준',
    formFactor: '원통형',
    updatedAt: '2026-09-10',
    items: [
      { id: 13, group: 'Electrode', name: 'Slurry Mixing', types: ['Anode', 'Cathode'], order: 1 },
      { id: 14, group: 'Electrode', name: 'Coating', types: ['Anode', 'Cathode'], order: 2 },
      { id: 15, group: 'Electrode', name: 'Calendering', types: ['Anode', 'Cathode'], order: 3 },
      { id: 16, group: 'Electrode', name: 'Slitting', types: ['Anode', 'Cathode'], order: 4 },
      { id: 17, group: 'Cell Assembly', name: 'Vacuum Drying', types: ['Anode', 'Cathode'], order: 5 },
      { id: 18, group: 'Cell Assembly', name: 'Winding', types: [], order: 6 },
      { id: 19, group: 'Cell Assembly', name: "Ass'y_1 (Spot, Beading)", types: [], order: 7 },
      { id: 20, group: 'Cell Assembly', name: 'J/R Dry', types: [], order: 8 },
      { id: 21, group: 'Cell Assembly', name: "Ass'y_2 (Filling, Laser, Crimping)", types: [], order: 9 },
      { id: 22, group: 'Cell Formation', name: 'PF', types: [], order: 10 },
      { id: 23, group: 'Cell Formation', name: '24hr Aging', types: [], order: 11 },
      { id: 24, group: 'Cell Formation', name: 'MP', types: [], order: 12 },
      { id: 25, group: 'Cell Formation', name: '14day Aging', types: [], order: 13 },
    ],
  },
];
