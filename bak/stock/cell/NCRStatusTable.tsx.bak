import type { NCRStatusItemAPI, ProjectHeader } from './types';
import styles from '../../../../styles/stock/cell/NCRStatus.module.css';

interface NCRStatusTableProps {
  items: NCRStatusItemAPI[];
  projects: ProjectHeader[];
}

const formatValue = (value: number): string => {
  return value === 0 ? '-' : value.toString();
};

export default function NCRStatusTable({ items, projects }: NCRStatusTableProps) {
  // 구형 프로젝트 여부 (projectNo가 있으면 2행 헤더, 없으면 1행 헤더)
  const hasOldProject = projects.some(p => p.projectNo !== null);

  // 카테고리별로 아이템 그룹화
  const getItemsByCategory = (category: string) => {
    return items.filter(item => item.category === category);
  };

  const formationItems = getItemsByCategory('Formation');
  const inspectionItems = getItemsByCategory('Inspection');
  const otherItems = getItemsByCategory('Other');

  // 카테고리별 소계 계산
  const calculateCategoryTotal = (categoryItems: NCRStatusItemAPI[]) => {
    const total: Record<string, number> = {};

    projects.forEach((project, projectIdx) => {
      const projectKey = `${project.projectNo}_${project.projectName}`;
      total[projectKey] = categoryItems.reduce((sum, item) => {
        return sum + (item.counts[projectIdx]?.count || 0);
      }, 0);
    });

    return total;
  };

  const formationTotal = calculateCategoryTotal(formationItems);
  const inspectionTotal = calculateCategoryTotal(inspectionItems);
  const otherTotal = calculateCategoryTotal(otherItems);

  // 전체 합계
  const grandTotalByProject: Record<string, number> = {};
  projects.forEach((project, projectIdx) => {
    const projectKey = `${project.projectNo}_${project.projectName}`;
    grandTotalByProject[projectKey] = items.reduce((sum, item) => {
      return sum + (item.counts[projectIdx]?.count || 0);
    }, 0);
  });

  const grandTotal = Object.values(grandTotalByProject).reduce((a, b) => a + b, 0);

  // 로우 렌더링 헬퍼 함수
  const renderItemRow = (
    item: NCRStatusItemAPI,
    index: number,
    category: string,
    categoryItems: NCRStatusItemAPI[]
  ) => (
    <tr key={`${category}-${index}`}>
      {index === 0 && (
        <td rowSpan={categoryItems.length} className={styles.tdCategory}>
          {category === 'Formation' ? 'Formation' : category === 'Inspection' ? 'Inspection' : '기타'}
        </td>
      )}
      <td className={styles.tdNcrType}>{item.ncrType}</td>
      <td className={styles.tdDetails}>{item.title}</td>
      <td className={styles.tdCode}>{item.code}</td>
      {item.counts.map((count, countIdx) => (
        <td key={`count-${countIdx}`} className={styles.tdValue}>
          {formatValue(count.count)}
        </td>
      ))}
    </tr>
  );

  return (
    <div className={styles.tableContainer}>
      <table className={styles.ncrTable}>
        <thead>
          {/* 1행: 분류, NCR 종류, 세부사항, 표기, 프로젝트 이름들 */}
          <tr>
            <th className={styles.thCategory} rowSpan={hasOldProject ? 2 : 1}>
              분류
            </th>
            <th className={styles.thNcrType} rowSpan={hasOldProject ? 2 : 1}>
              NCR 종류
            </th>
            <th className={styles.thDetails} rowSpan={hasOldProject ? 2 : 1}>
              세부사항
            </th>
            <th className={styles.thCode} rowSpan={hasOldProject ? 2 : 1}>
              표기
            </th>

            {/* 1행: 프로젝트 이름들 (projectName) */}
            {projects.map((p) => (
              <th
                key={`name-${p.projectNo}_${p.projectName}`}
                className={styles.thProject}
                rowSpan={p.projectNo ? 1 : 2}
              >
                {p.projectName}
              </th>
            ))}
          </tr>

          {/* 2행: 프로젝트 번호들 (projectNo) - 구형 프로젝트만 */}
          {hasOldProject && (
            <tr>
              {projects.map((p) =>
                p.projectNo ? (
                  <th key={`no-${p.projectNo}_${p.projectName}`} className={styles.thProject}>
                    {p.projectNo}
                  </th>
                ) : null
              )}
            </tr>
          )}
        </thead>

        <tbody>
          {/* Formation 섹션 */}
          {formationItems.map((item, idx) => renderItemRow(item, idx, 'Formation', formationItems))}

          {/* Inspection 섹션 */}
          {inspectionItems.map((item, idx) => renderItemRow(item, idx, 'Inspection', inspectionItems))}

          {/* Other 섹션 */}
          {otherItems.map((item, idx) => renderItemRow(item, idx, 'Other', otherItems))}

          {/* 중 합 (소계) */}
          <tr className={styles.subtotalRow}>
            <td colSpan={4} className={styles.subtotalLabel}>
              중 합
            </td>
            {projects.map((project, idx) => {
              const projectKey = `${project.projectNo}_${project.projectName}`;
              const subtotal =
                (formationTotal[projectKey] || 0) +
                (inspectionTotal[projectKey] || 0) +
                (otherTotal[projectKey] || 0);
              return (
                <td key={`subtotal-${idx}`} className={styles.tdValue}>
                  {formatValue(subtotal)}
                </td>
              );
            })}
          </tr>

          {/* NCR 총 합 */}
          <tr className={styles.grandTotalRow}>
            <td colSpan={4} className={styles.grandTotalLabel}>
              NCR 총 합
            </td>
            <td colSpan={projects.length} className={styles.tdValue}>
              {formatValue(grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
