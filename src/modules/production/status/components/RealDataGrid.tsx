import { getDaysInMonth } from '../utils/dateUtils';
import styles from '../../../../styles/production/status/ProductionStatusGrid.module.css';

interface DayData {
  day: number;
  output: number;
  ng: number | null;
  yield: number | null;
}

interface ProcessData {
  data: DayData[];
  total: {
    totalOutput: number;
    targetQuantity: number | null;
    progress: number | null;
  };
}

interface RealDataResponse {
  category: string;
  type: string;
  month: string;
  processes: {
    mixing?: ProcessData;
    coatingSingle?: ProcessData;
    coatingDouble?: ProcessData;
    press?: ProcessData;
    slitting?: ProcessData;
    notching?: ProcessData;
    [key: string]: ProcessData | undefined;
  };
}

interface RealDataGridProps {
  data: RealDataResponse;
  year: number;
  month: number;
}

export default function RealDataGrid({ data, year, month }: RealDataGridProps) {
  const daysInMonth = getDaysInMonth(year, month);

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
    const date = new Date(year, month - 1, day);
    return date.getDay(); // 0 = 일요일, 6 = 토요일
  };

  // 요일에 따른 CSS 클래스 반환
  const getDateClassName = (day: number): string => {
    // 공휴일이면 빨간색
    if (isHoliday(year, month, day)) return styles.sunday;

    const dayOfWeek = getDayOfWeek(day);
    if (dayOfWeek === 0) return styles.sunday; // 일요일
    if (dayOfWeek === 6) return styles.saturday; // 토요일
    return '';
  };

  // 모든 공정 데이터가 없으면 표시하지 않음
  if (!data.processes || Object.keys(data.processes).length === 0) {
    return null;
  }

  // 공정 이름 매핑
  const processNameMap: Record<string, string> = {
    mixing: 'Mixing',
    coatingSingle: 'Coating Single',
    coatingDouble: 'Coating Double',
    press: 'Press',
    slitting: 'Slitting',
    notching: 'Notching',
  };

  // 공정별 생산량 단위 매핑
  const processUnitMap: Record<string, string> = {
    mixing: 'KG',
    coatingSingle: 'M',
    coatingDouble: 'M',
    press: 'M',
    slitting: 'M',
    notching: 'ea',
  };

  // 렌더링할 공정 목록 (데이터가 있는 공정만)
  const processesToRender = Object.entries(data.processes).filter(([_, processData]) => processData !== undefined);

  if (processesToRender.length === 0) {
    return null;
  }

  return (
    <>
      <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 600 }}>실제 데이터</h3>
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
            {processesToRender.map(([processKey, processData]) => {
              if (!processData) return null;

              // 일별 데이터를 객체로 변환
              const dailyDataMap: Record<number, DayData> = {};
              processData.data.forEach(item => {
                dailyDataMap[item.day] = item;
              });

              const processName = processNameMap[processKey] || processKey;
              const processUnit = processUnitMap[processKey] || 'ea';

              // NG와 수율 합계 계산
              const totalNG = processData.data.reduce((sum, item) => sum + (item.ng || 0), 0);
              const averageYield =
                processData.total.totalOutput > 0
                  ? ((processData.total.totalOutput - totalNG) / processData.total.totalOutput) * 100
                  : 0;

              // Mixing과 Coating Single만 회색 배경 적용
              const shouldApplyGrayBg = processKey === 'mixing' || processKey === 'coatingSingle';

              return (
                <>
                  {/* 생산량 행 */}
                  <tr key={`${processKey}-production`}>
                    <td rowSpan={3} className={styles.processHeader}>
                      {processName}
                    </td>
                    <td className={styles.rowLabel}>생산량({processUnit})</td>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const dayData = dailyDataMap[day];
                      return <td key={day}>{dayData?.output || ''}</td>;
                    })}
                    <td>{processData.total.totalOutput}</td>
                    <td rowSpan={3}>{processData.total.progress !== null ? `${processData.total.progress}%` : ''}</td>
                    <td rowSpan={3}>
                      {processData.total.targetQuantity !== null ? processData.total.targetQuantity : ''}
                    </td>
                  </tr>

                  {/* NG 행 */}
                  <tr key={`${processKey}-ng`}>
                    <td className={styles.rowLabel}>NG</td>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const dayData = dailyDataMap[day];
                      return (
                        <td
                          key={day}
                          style={
                            shouldApplyGrayBg
                              ? { background: '#d1d5db' }
                              : { color: '#ef4444', fontWeight: 500 }
                          }
                        >
                          {dayData?.ng !== null && dayData?.ng !== undefined ? dayData.ng : ''}
                        </td>
                      );
                    })}
                    <td style={shouldApplyGrayBg ? { background: '#d1d5db' } : { color: '#ef4444', fontWeight: 500 }}>
                      {totalNG}
                    </td>
                  </tr>

                  {/* 수율 행 */}
                  <tr key={`${processKey}-yield`}>
                    <td className={styles.rowLabel} style={{ borderBottom: '2px solid #9ca3af' }}>
                      수율(%)
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const dayData = dailyDataMap[day];
                      return (
                        <td
                          key={day}
                          style={
                            shouldApplyGrayBg
                              ? { background: '#d1d5db', borderBottom: '2px solid #9ca3af' }
                              : {
                                  color: '#10b981',
                                  fontWeight: 600,
                                  borderBottom: '2px solid #9ca3af',
                                }
                          }
                        >
                          {dayData?.yield !== null && dayData?.yield !== undefined
                            ? `${dayData.yield.toFixed(1)}%`
                            : ''}
                        </td>
                      );
                    })}
                    <td
                      style={
                        shouldApplyGrayBg
                          ? { background: '#d1d5db', borderBottom: '2px solid #9ca3af' }
                          : {
                              color: '#10b981',
                              fontWeight: 600,
                              borderBottom: '2px solid #9ca3af',
                            }
                      }
                    >
                      {averageYield.toFixed(1)}%
                    </td>
                  </tr>
                </>
              );
            })}

            {/* 전체 합계 행 */}
            <tr className={styles.totalRow}>
              <td colSpan={daysInMonth + 2}>합계</td>
              <td className={styles.yieldCell}>
                {(() => {
                  const totalOutput = processesToRender.reduce(
                    (sum, [_, processData]) => sum + (processData?.total.totalOutput || 0),
                    0
                  );
                  const totalNG = processesToRender.reduce((sum, [_, processData]) => {
                    return sum + (processData?.data.reduce((s, item) => s + (item.ng || 0), 0) || 0);
                  }, 0);
                  const overallYield = totalOutput > 0 ? ((totalOutput - totalNG) / totalOutput) * 100 : 0;
                  return `${overallYield.toFixed(1)}%`;
                })()}
              </td>
              <td>
                {(() => {
                  const totalOutput = processesToRender.reduce(
                    (sum, [_, processData]) => sum + (processData?.total.totalOutput || 0),
                    0
                  );
                  const totalTarget = processesToRender.reduce(
                    (sum, [_, processData]) => sum + (processData?.total.targetQuantity || 0),
                    0
                  );
                  return totalTarget > 0 ? `${((totalOutput / totalTarget) * 100).toFixed(1)}%` : '';
                })()}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
