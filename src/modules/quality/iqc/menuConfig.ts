/** IQC 하위 메뉴 생성 */
export const createIQCMenus = (projectId: number) => [
  { title: 'Summary', path: `/quality/iqc/${projectId}?menu=Summary` },
  { title: '양극재1', path: `/quality/iqc/${projectId}?menu=CathodeMaterial1` },
  { title: '양극재2', path: `/quality/iqc/${projectId}?menu=CathodeMaterial2` },
  { title: '음극재', path: `/quality/iqc/${projectId}?menu=AnodeMaterial` },
  { title: '도전재1', path: `/quality/iqc/${projectId}?menu=ConductiveAdditive` },
  { title: '도전재2', path: `/quality/iqc/${projectId}?menu=ConductiveAdditive2` },
  { title: '집전체', path: `/quality/iqc/${projectId}?menu=CurrentCollector` },
  { title: '분리막', path: `/quality/iqc/${projectId}?menu=Separator` },
  { title: '전해액', path: `/quality/iqc/${projectId}?menu=Electrolyte` },
  { title: '파우치', path: `/quality/iqc/${projectId}?menu=Pouch` },
  { title: '리드탭', path: `/quality/iqc/${projectId}?menu=LeadTab` },
];
