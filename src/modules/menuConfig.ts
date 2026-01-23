export const MENU_CONFIG = {
  dashboard: { title: '프로젝트 현황 및 등록', path: '/main' },

  project: {
    title: '생산 관리',
    path: '/project',
    sub: [
      { title: '생산계획', path: '/project/plan' },
      { title: '설계 및 자재 소요량', path: '/project/spec' },
      { title: '작업 일지', path: '/project/log' },
      { title: '생산 현황 (수율)', path: '/project/status' },
      { title: 'Lot 관리', path: '/project/lot' },
      { title: 'Lot 검색', path: '/project/search' },
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
      { title: '전체', path: '/draw/list' },
      { title: '공장', path: '/draw/list?category=공장' },
      { title: '설비', path: '/draw/list?category=설비' },
      { title: '제품', path: '/draw/list?category=제품' },
      { title: 'OEM/ODM', path: '/draw/list?category=OEM/ODM' },
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
