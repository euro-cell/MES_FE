export const MENU_CONFIG = {
  dashboard: { title: '프로젝트 현황 및 등록', path: '/main' },

  production: {
    title: '생산 관리',
    path: '/prod',
    sub: [
      { title: '생산계획', path: '/prod/plan' },
      { title: '설계 및 자재 소요량', path: '/prod/spec' },
      { title: '작업 일지', path: '/prod/log' },
      { title: '생산 현황 (수율)', path: '/prod/status' },
      { title: 'Lot 관리', path: '/prod/lot' },
    ],
  },

  stock: {
    title: '재고 관리',
    path: '/stock',
    sub: [
      { title: '원자재 관리', path: '/stock/material' },
      { title: '셀 관리', path: '/stock/cell' },
    ],
  },

  quality: {
    title: '품질 관리',
    path: '/quality-new',
    sub: [
      { title: 'IQC', path: '/quality-new/iqc' },
      { title: 'LQC', path: '/quality-new/lqc' },
      { title: 'OQC', path: '/quality-new/oqc' },
    ],
  },

  plant: {
    title: '설비 관리',
    path: '/plant',
    sub: [
      { title: '설비 이력 카드', path: '/plant/history' },
      { title: '설비 관리 대장', path: '/plant/list' },
    ],
  },

  draw: {
    title: '도면 관리',
    path: '/draw',
    sub: [{ title: '도면 관리 대장', path: '/draw/list' }],
  },

  etc: {
    title: '기타',
    path: '/etc',
    sub: [
      { title: '인원등록', path: '/users' },
      { title: '메뉴접근관리', path: '/permission' },
      { title: '환경관리', path: '/environment' },
      { title: '고객 코드 관리 대장', path: '/customer-code' },
    ],
  },
};
