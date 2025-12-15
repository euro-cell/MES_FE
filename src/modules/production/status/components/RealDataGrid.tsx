import { getDaysInMonth } from '../utils/dateUtils';
import styles from '../../../../styles/production/status/ProductionStatusGrid.module.css';

interface DayData {
  day: number;
  output: number;
  ng: number | null;
  yield: number | null;
}

interface RealDataResponse {
  data: DayData[];
  total: {
    totalOutput: number;
    targetQuantity: number;
    progress: number;
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

  // 일별 데이터를 객체로 변환 (day를 key로)
  const dailyDataMap: Record<number, DayData> = {};
  data.data.forEach(item => {
    dailyDataMap[item.day] = item;
  });

  return (
    <>
      <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 600 }}>실제 데이터 (Mixing)</h3>
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
          {/* 생산량 행 */}
          <tr>
            <td className={styles.processHeader}>Mixing</td>
            <td className={styles.rowLabel}>생산량(ea)</td>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayData = dailyDataMap[day];
              return <td key={day}>{dayData?.output || ''}</td>;
            })}
            <td>{data.total.totalOutput}</td>
            <td>{data.total.progress}%</td>
            <td>{data.total.targetQuantity}</td>
          </tr>

          {/* 전체 합계 행 */}
          <tr className={styles.totalRow}>
            <td colSpan={daysInMonth + 2}>합계</td>
            <td>{data.total.totalOutput}</td>
            <td>{data.total.progress}%</td>
            <td></td>
          </tr>
        </tbody>
        </table>
      </div>
    </>
  );
}
