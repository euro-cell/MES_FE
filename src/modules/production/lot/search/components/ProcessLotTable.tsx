import type { ProcessLotInfo } from '../LotSearchTypes';
import styles from '../../../../../styles/production/lot/ProcessLotTable.module.css';

interface ProcessLotTableProps {
  data: ProcessLotInfo[];
}

// 공정 데이터를 카테고리별로 그룹화하여 표시
export default function ProcessLotTable({ data }: ProcessLotTableProps) {
  // 카테고리별 공정 정의
  const categories = [
    { name: '전극공정', processes: ['Mixing', 'Coating', 'Calendering', 'Slitting', 'Notching'] },
    { name: '조립 공정', processes: ['Assembly'] },
    { name: '화성 공정', processes: ['Formation'] },
  ];

  // data에서 각 공정의 Lot 찾기
  const findLot = (processType: string) => {
    return data.find(d => d.processType === processType);
  };

  return (
    <div className={styles.tableContainer}>
      <h3 className={styles.tableTitle}>공정 Lot 정보</h3>
      <table className={styles.processTable}>
        <thead>
          <tr>
            <th>공정</th>
            <th>구분</th>
            <th>Lot (Cathode)</th>
            <th>Lot (Anode)</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category =>
            category.processes.map((process, processIndex) => {
              const lotInfo = findLot(process);
              const isFirstInCategory = processIndex === 0;
              const isAssemblyOrFormation = category.name === '조립 공정' || category.name === '화성 공정';

              return (
                <tr key={`${category.name}-${process}`}>
                  {isFirstInCategory && (
                    <td rowSpan={category.processes.length} className={styles.categoryCell}>
                      {category.name}
                    </td>
                  )}
                  <td className={styles.processCell}>{process}</td>
                  {isAssemblyOrFormation ? (
                    <td colSpan={2} className={styles.lotCell}>
                      {lotInfo?.lot || ''}
                    </td>
                  ) : (
                    <>
                      <td className={styles.lotCell}>{lotInfo?.cathodeLot || ''}</td>
                      <td className={styles.lotCell}>{lotInfo?.anodeLot || ''}</td>
                    </>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
