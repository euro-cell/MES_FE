/** OQC 하위 메뉴 생성 */
export const createOQCMenus = (projectId: number) => [
  { title: 'Summary', path: `/quality/oqc/${projectId}?menu=Summary` },
  { title: 'Grading', path: `/quality/oqc/${projectId}?menu=Grading` },
  { title: '외관', path: `/quality/oqc/${projectId}?menu=Appearance` },
  { title: '치수', path: `/quality/oqc/${projectId}?menu=Dimension` },
  { title: '중량', path: `/quality/oqc/${projectId}?menu=Weight` },
];
