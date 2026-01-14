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
      { title: 'Lot 검색', path: '/prod/search' },
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
    path: '/quality',
    sub: [
      { title: 'LQC', path: '/quality/lqc' },
      { title: 'OQC', path: '/quality/oqc' },
    ],
  },

  plant: {
    title: '설비 관리',
    path: '/plant',
    sub: [
      { title: '생산', path: '/plant/production' },
      { title: '개발', path: '/plant/development' },
      { title: '측정', path: '/plant/measurement' },
    ],
  },

  draw: {
    title: '도면 관리',
    path: '/draw',
    sub: [
      { title: '공장 도면', path: '/draw/factory' },
      { title: '셀 도면', path: '/draw/cell' },
      { title: '도면 등록', path: '/draw/register' },
      { title: '도면 관리 대장', path: '/draw/list' },
    ],
  },

  etc: {
    title: '기타',
    path: '/etc',
    sub: [
      { title: '인원등록', path: '/etc/users' },
      { title: '메뉴접근관리', path: '/etc/permission' },
      { title: '환경관리', path: '/etc/condition' },
      { title: '고객 코드 관리 대장', path: '/etc/customer' },
    ],
  },
};
