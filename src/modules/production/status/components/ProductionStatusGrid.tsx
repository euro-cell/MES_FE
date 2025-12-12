import { getDaysInMonth } from '../utils/dateUtils';
import type { MonthlyStatusData, ProcessMonthlyData } from '../StatusTypes';
import styles from '../../../../styles/production/status/ProductionStatusGrid.module.css';

interface ProductionStatusGridProps {
  data: MonthlyStatusData;
}

export default function ProductionStatusGrid({ data }: ProductionStatusGridProps) {
  const daysInMonth = getDaysInMonth(data.year, data.month);

  return (
    <div className={styles.gridContainer}>
      <table className={styles.statusTable}>
        <thead>
          <tr>
            <th className={styles.processColumn} colSpan={2}>
              제조일자
            </th>
            {Array.from({ length: daysInMonth }, (_, i) => (
              <th key={i + 1}>{i + 1}</th>
            ))}
            <th>합계</th>
            <th>진행률</th>
            <th>목표수량</th>
          </tr>
        </thead>
        <tbody>
          {data.processes.map(process => (
            <ProcessRows key={process.processId} process={process} daysInMonth={daysInMonth} />
          ))}
          {/* 전체 합계 행 */}
          <tr className={styles.totalRow}>
            <td colSpan={2}>합계</td>
            {Array.from({ length: daysInMonth }, (_, day) => (
              <td key={day}></td>
            ))}
            <td>{data.overallTotal}</td>
            <td>{data.overallProgress}%</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface ProcessRowsProps {
  process: ProcessMonthlyData;
  daysInMonth: number;
}

function ProcessRows({ process, daysInMonth }: ProcessRowsProps) {
  const totalProduction = process.subItems.reduce((sum, item) => sum + item.totalProduction, 0);
  const totalNG = process.subItems.reduce((sum, item) => sum + item.totalNG, 0);
  const averageYield = totalProduction > 0 ? ((totalProduction - totalNG) / totalProduction) * 100 : 0;
  const progressRate = process.targetQuantity ? ((totalProduction / process.targetQuantity) * 100).toFixed(1) : '0';

  return (
    <>
      {/* 생산량 행 */}
      <tr>
        <td rowSpan={3} className={styles.processHeader}>
          {process.processTitle}
        </td>
        <td className={styles.rowLabel}>생산량(ea)</td>
        {Array.from({ length: daysInMonth }, (_, day) => {
          const dayData = process.subItems[0]?.dailyData[day + 1];
          return <td key={day}>{dayData?.productionQuantity || ''}</td>;
        })}
        <td>{totalProduction}</td>
        <td rowSpan={3}>{progressRate}%</td>
        <td rowSpan={3}>{process.targetQuantity || ''}</td>
      </tr>

      {/* NG 행 */}
      <tr>
        <td className={styles.rowLabel}>NG</td>
        {Array.from({ length: daysInMonth }, (_, day) => {
          const dayData = process.subItems[0]?.dailyData[day + 1];
          return (
            <td key={day} className={styles.ngCell}>
              {dayData?.ngQuantity || ''}
            </td>
          );
        })}
        <td className={styles.ngCell}>{totalNG}</td>
      </tr>

      {/* 수율 행 */}
      <tr className={styles.yieldRow}>
        <td className={styles.rowLabel}>수율(%)</td>
        {Array.from({ length: daysInMonth }, (_, day) => {
          const dayData = process.subItems[0]?.dailyData[day + 1];
          return (
            <td key={day} className={styles.yieldCell}>
              {dayData?.yield ? `${dayData.yield.toFixed(1)}%` : ''}
            </td>
          );
        })}
        <td className={styles.yieldCell}>{averageYield.toFixed(1)}%</td>
      </tr>
    </>
  );
}
