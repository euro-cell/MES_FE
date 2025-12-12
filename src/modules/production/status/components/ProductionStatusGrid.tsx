import { getDaysInMonth } from '../utils/dateUtils';
import type { MonthlyStatusData, ProcessMonthlyData } from '../StatusTypes';
import styles from '../../../../styles/production/status/ProductionStatusGrid.module.css';

interface ProductionStatusGridProps {
  data: MonthlyStatusData;
}

export default function ProductionStatusGrid({ data }: ProductionStatusGridProps) {
  const daysInMonth = getDaysInMonth(data.year, data.month);

  // 한국 공휴일 체크 함수
  const isHoliday = (year: number, month: number, day: number): boolean => {
    const holidays: Record<string, string> = {
      '1-1': '신정',
      '3-1': '삼일절',
      '5-5': '어린이날',
      '6-6': '현충일',
      '8-15': '광복절',
      '10-3': '개천절',
      '10-9': '한글날',
      '12-25': '크리스마스',
    };

    // 설날, 추석 등 음력 공휴일은 매년 날짜가 변경되므로 연도별로 정의
    const lunarHolidays: Record<number, string[]> = {
      2024: ['2-9', '2-10', '2-11', '2-12', '9-16', '9-17', '9-18', '5-6', '5-15'],
      2025: ['1-28', '1-29', '1-30', '1-31', '10-5', '10-6', '10-7', '10-8', '5-5', '8-6'],
      2026: ['2-16', '2-17', '2-18', '2-19', '9-24', '9-25', '9-26', '9-27', '5-19', '8-25'],
    };

    const dateKey = `${month}-${day}`;

    // 양력 공휴일 체크
    if (holidays[dateKey]) return true;

    // 음력 공휴일 체크
    if (lunarHolidays[year]?.includes(dateKey)) return true;

    return false;
  };

  // 날짜의 요일을 계산하는 함수
  const getDayOfWeek = (day: number): number => {
    const date = new Date(data.year, data.month - 1, day);
    return date.getDay(); // 0 = 일요일, 6 = 토요일
  };

  // 요일에 따른 CSS 클래스 반환
  const getDateClassName = (day: number): string => {
    // 공휴일이면 빨간색
    if (isHoliday(data.year, data.month, day)) return styles.sunday;

    const dayOfWeek = getDayOfWeek(day);
    if (dayOfWeek === 0) return styles.sunday; // 일요일
    if (dayOfWeek === 6) return styles.saturday; // 토요일
    return '';
  };

  // 전체 평균 수율 계산
  const calculateOverallYield = (): number => {
    let totalProduction = 0;
    let totalNG = 0;

    data.processes.forEach(process => {
      process.subItems.forEach(item => {
        totalProduction += item.totalProduction;
        totalNG += item.totalNG;
      });
    });

    return totalProduction > 0 ? ((totalProduction - totalNG) / totalProduction) * 100 : 0;
  };

  // 전체 진행률 계산
  const calculateOverallProgress = (): number => {
    let totalProduction = 0;
    let totalTarget = 0;

    data.processes.forEach(process => {
      const processProduction = process.subItems.reduce((sum, item) => sum + item.totalProduction, 0);
      totalProduction += processProduction;
      if (process.targetQuantity) {
        totalTarget += process.targetQuantity;
      }
    });

    return totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;
  };

  return (
    <div className={styles.gridContainer}>
      <table className={styles.statusTable}>
        <thead>
          <tr>
            <th className={styles.processColumn} colSpan={2}>
              제조일자
            </th>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              return (
                <th key={day} className={getDateClassName(day)}>
                  {day}
                </th>
              );
            })}
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
            <td colSpan={daysInMonth + 2}>합계</td>
            <td className={styles.yieldCell}>{calculateOverallYield().toFixed(1)}%</td>
            <td>{calculateOverallProgress().toFixed(1)}%</td>
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
