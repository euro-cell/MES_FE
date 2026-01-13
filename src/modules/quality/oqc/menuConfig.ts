/** OQC 하위 메뉴 생성 */
export const createOQCMenus = (projectId: number) => [
  { title: 'Summary', path: `/quality/oqc/${projectId}?menu=Summary` },
];
