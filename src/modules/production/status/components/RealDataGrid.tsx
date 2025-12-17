import React from 'react';
import { getDaysInMonth } from '../utils/dateUtils';
import styles from '../../../../styles/production/status/ProductionStatusGrid.module.css';

// 일반 공정 일별 데이터
interface DayData {
  day: number;
  output: number;
  ng: number | null;
  yield: number | null;
}

// Forming 서브타입 일별 데이터 (yield 없음)
interface FormingSubTypeDayData {
  day: number;
  output: number;
  ng: number | null;
}

// Forming 수율 일별 데이터
interface FormingYieldDayData {
  day: number;
  yield: number | null;
}

// Forming 서브타입 데이터 (yield 없음)
interface FormingSubTypeData {
  data: FormingSubTypeDayData[];
  total: {
    totalOutput: number;
    targetQuantity: number | null;
    progress: number | null;
    totalNg?: number | null;
  };
}

// Forming 수율 데이터
interface FormingYieldData {
  data: FormingYieldDayData[];
  total: number | null;
}

// 일반 공정 데이터
interface ProcessData {
  data: DayData[];
  total: {
    totalOutput: number;
    targetQuantity: number | null;
    progress: number | null;
    totalNg?: number | null;
    totalYield?: number | null;
  };
}

// VD 공정 일별 데이터 (Cathode/Anode 분리)
interface VDDayData {
  day: number;
  cathodeOutput: number;
  anodeOutput: number;
  cathodeNg: number | null;
  anodeNg: number | null;
  cathodeYield: number | null;
  anodeYield: number | null;
}

// VD 공정 total 구조
interface VDTotal {
  cathode: {
    totalOutput: number;
    targetQuantity: number | null;
    progress: number | null;
    totalNg: number | null;
    totalYield: number | null;
  };
  anode: {
    totalOutput: number;
    targetQuantity: number | null;
    progress: number | null;
    totalNg: number | null;
    totalYield: number | null;
  };
}

// VD 공정 데이터
interface VDProcessData {
  data: VDDayData[];
  total: VDTotal;
}

// Forming 공정 데이터 (4개 서브타입 + 별도 yield + 최상위 targetQuantity, progress)
interface FormingProcessData {
  cutting: FormingSubTypeData;
  forming: FormingSubTypeData;
  folding: FormingSubTypeData;
  topCutting: FormingSubTypeData;
  yield: FormingYieldData;
  targetQuantity: number | null;
  progress: number | null;
}

// Forming 서브타입 키 배열
const FORMING_SUBTYPES = ['cutting', 'forming', 'folding', 'topCutting'] as const;
const FORMING_SUBTYPE_LABELS: Record<string, string> = {
  cutting: 'Cutting',
  forming: 'Forming',
  folding: 'Folding',
  topCutting: 'Top Cutting',
};

// Stacking NCR 서브타입 키 배열
const STACKING_NCR_SUBTYPES = ['hiPot', 'weight', 'thickness', 'alignment'] as const;
const STACKING_NCR_SUBTYPE_LABELS: Record<string, string> = {
  hiPot: 'Hi pot',
  weight: '무게',
  thickness: '두께',
  alignment: 'Alignment',
};

// Stacking 일별 데이터
interface StackingDayData {
  day: number;
  output: number;
  ng: number | null;
  ncr: {
    hiPot: number | null;
    weight: number | null;
    thickness: number | null;
    alignment: number | null;
  } | null;
}

// Stacking 공정 데이터
interface StackingProcessData {
  data: StackingDayData[];
  total: {
    totalOutput: number;
    targetQuantity: number | null;
    progress: number | null;
    totalNg: number | null;
    ncr: {
      hiPot: number | null;
      weight: number | null;
      thickness: number | null;
      alignment: number | null;
    } | null;
    totalYield: number | null;
  };
}

interface RealDataResponse {
  category: string;
  type?: string;
  month: string;
  processes: {
    // 전극 공정 (Electrode)
    mixing?: ProcessData;
    coatingSingle?: ProcessData;
    coatingDouble?: ProcessData;
    press?: ProcessData;
    slitting?: ProcessData;
    notching?: ProcessData;
    // 조립 공정 (Assembly)
    vd?: VDProcessData;
    forming?: FormingProcessData;
    stacking?: StackingProcessData;
    preWelding?: ProcessData;
    mainWelding?: ProcessData;
    sealing?: ProcessData;
    filling?: ProcessData;
    // 화성 공정 (Formation)
    preFormation?: ProcessData;
    degass?: ProcessData;
    mainFormation?: ProcessData;
    aging?: ProcessData;
    grading?: ProcessData;
    inspection?: ProcessData;
    [key: string]: ProcessData | VDProcessData | FormingProcessData | StackingProcessData | undefined;
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
    // 전극 공정 (Electrode)
    mixing: 'Mixing',
    coatingSingle: 'Coating Single',
    coatingDouble: 'Coating Double',
    press: 'Press',
    slitting: 'Slitting',
    notching: 'Notching',
    // 조립 공정 (Assembly)
    vd: 'V/D',
    forming: 'Forming',
    stacking: 'Stack',
    preWelding: 'Pre Welding',
    mainWelding: 'Main Welding',
    sealing: 'Sealing',
    filling: 'E/L Filling',
    // 화성 공정 (Formation)
    preFormation: 'Pre Formation',
    degass: 'Degass',
    mainFormation: 'Main Formation',
    aging: 'Aging',
    grading: 'Grading',
    inspection: '외관검사',
  };

  // 공정별 생산량 단위 매핑
  const processUnitMap: Record<string, string> = {
    // 전극 공정 (Electrode)
    mixing: 'KG',
    coatingSingle: 'M',
    coatingDouble: 'M',
    press: 'M',
    slitting: 'M',
    notching: 'ea',
    // 조립 공정 (Assembly)
    vd: 'ea',
    forming: 'ea',
    stacking: 'ea',
    preWelding: 'ea',
    mainWelding: 'ea',
    sealing: 'ea',
    filling: 'ea',
    // 화성 공정 (Formation)
    preFormation: 'ea',
    degass: 'ea',
    mainFormation: 'ea',
    aging: 'ea',
    grading: 'ea',
    inspection: 'ea',
  };

  // VD 공정인지 확인
  const isVDProcess = (key: string): boolean => key === 'vd';

  // Forming 공정인지 확인
  const isFormingProcess = (key: string): boolean => key === 'forming';

  // Stacking 공정인지 확인
  const isStackingProcess = (key: string): boolean => key === 'stacking';

  // VD 데이터인지 타입 체크
  const isVDProcessData = (
    processData: ProcessData | VDProcessData | FormingProcessData | StackingProcessData
  ): processData is VDProcessData => {
    return 'data' in processData && Array.isArray(processData.data) && processData.data.length > 0 && 'cathodeOutput' in processData.data[0];
  };

  // Forming 데이터인지 타입 체크
  const isFormingProcessData = (
    processData: ProcessData | VDProcessData | FormingProcessData | StackingProcessData
  ): processData is FormingProcessData => {
    return 'cutting' in processData && 'forming' in processData && 'folding' in processData && 'topCutting' in processData;
  };

  // Stacking 데이터인지 타입 체크
  const isStackingProcessData = (
    processData: ProcessData | VDProcessData | FormingProcessData | StackingProcessData
  ): processData is StackingProcessData => {
    return 'total' in processData && 'ncr' in (processData as StackingProcessData).total;
  };

  // 렌더링할 공정 목록 (데이터가 있는 공정만, null이 아닌 것만)
  const processesToRender = Object.entries(data.processes).filter(
    ([_, processData]) => processData !== undefined && processData !== null
  );

  if (processesToRender.length === 0) {
    return null;
  }

  // 서브타입이 있는 공정이 있는지 확인 (헤더 colSpan 결정용)
  const hasSubTypeProcess = processesToRender.some(([key]) => isVDProcess(key) || isFormingProcess(key) || isStackingProcess(key));

  return (
    <div className={styles.gridContainer}>
        <table className={styles.statusTable}>
          <thead>
            <tr>
              <th className={styles.processColumn} colSpan={hasSubTypeProcess ? 3 : 2}>
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

              const processName = processNameMap[processKey] || processKey;
              const processUnit = processUnitMap[processKey] || 'ea';

              // VD 공정은 특별하게 렌더링 (Cathode, Anode 분리 - 6행)
              if (isVDProcess(processKey) && isVDProcessData(processData)) {
                const vdData = processData as VDProcessData;
                const vdDailyDataMap: Record<number, VDDayData> = {};
                vdData.data.forEach(item => {
                  vdDailyDataMap[item.day] = item;
                });

                return (
                  <React.Fragment key={processKey}>
                    {/* 생산량 - Cathode */}
                    <tr>
                      <td rowSpan={6} className={styles.processHeader}>
                        {processName}
                      </td>
                      <td rowSpan={2} className={styles.rowLabel}>
                        생산량({processUnit})
                      </td>
                      <td className={styles.subTypeLabel}>Cathode</td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayData = vdDailyDataMap[day];
                        return <td key={day}>{dayData?.cathodeOutput || ''}</td>;
                      })}
                      <td>{vdData.total.cathode.totalOutput}</td>
                      {/* VD 진행률 - Cathode (3행 차지) */}
                      <td rowSpan={3}>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Cathode</div>
                        <div>{vdData.total.cathode.progress !== null ? `${vdData.total.cathode.progress}%` : ''}</div>
                      </td>
                      {/* VD 목표수량 - Cathode (3행 차지) */}
                      <td rowSpan={3}>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Cathode</div>
                        <div>{vdData.total.cathode.targetQuantity !== null ? vdData.total.cathode.targetQuantity.toLocaleString() : ''}</div>
                      </td>
                    </tr>
                    {/* 생산량 - Anode */}
                    <tr>
                      <td className={styles.subTypeLabel}>Anode</td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayData = vdDailyDataMap[day];
                        return <td key={day}>{dayData?.anodeOutput || ''}</td>;
                      })}
                      <td>{vdData.total.anode.totalOutput}</td>
                    </tr>

                    {/* NG - Cathode */}
                    <tr>
                      <td rowSpan={2} className={styles.rowLabel}>
                        NG
                      </td>
                      <td className={styles.subTypeLabel}>Cathode</td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayData = vdDailyDataMap[day];
                        return (
                          <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                            {dayData?.cathodeNg !== null && dayData?.cathodeNg !== undefined ? dayData.cathodeNg : ''}
                          </td>
                        );
                      })}
                      <td style={{ color: '#ef4444', fontWeight: 500 }}>
                        {vdData.total.cathode.totalNg !== null ? vdData.total.cathode.totalNg : ''}
                      </td>
                    </tr>
                    {/* NG - Anode */}
                    <tr>
                      <td className={styles.subTypeLabel}>Anode</td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayData = vdDailyDataMap[day];
                        return (
                          <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                            {dayData?.anodeNg !== null && dayData?.anodeNg !== undefined ? dayData.anodeNg : ''}
                          </td>
                        );
                      })}
                      <td style={{ color: '#ef4444', fontWeight: 500 }}>
                        {vdData.total.anode.totalNg !== null ? vdData.total.anode.totalNg : ''}
                      </td>
                      {/* VD 진행률 - Anode (3행 차지) */}
                      <td rowSpan={3} style={{ borderBottom: '2px solid #9ca3af' }}>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Anode</div>
                        <div>{vdData.total.anode.progress !== null ? `${vdData.total.anode.progress}%` : ''}</div>
                      </td>
                      {/* VD 목표수량 - Anode (3행 차지) */}
                      <td rowSpan={3} style={{ borderBottom: '2px solid #9ca3af' }}>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Anode</div>
                        <div>{vdData.total.anode.targetQuantity !== null ? vdData.total.anode.targetQuantity.toLocaleString() : ''}</div>
                      </td>
                    </tr>

                    {/* 수율 - Cathode */}
                    <tr>
                      <td rowSpan={2} className={styles.rowLabel} style={{ borderBottom: '2px solid #9ca3af' }}>
                        수율(%)
                      </td>
                      <td className={styles.subTypeLabel}>Cathode</td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayData = vdDailyDataMap[day];
                        return (
                          <td key={day} style={{ color: '#10b981', fontWeight: 600 }}>
                            {dayData?.cathodeYield !== null && dayData?.cathodeYield !== undefined
                              ? `${dayData.cathodeYield.toFixed(1)}%`
                              : ''}
                          </td>
                        );
                      })}
                      <td style={{ color: '#10b981', fontWeight: 600 }}>
                        {vdData.total.cathode.totalYield !== null ? `${vdData.total.cathode.totalYield}%` : ''}
                      </td>
                    </tr>
                    {/* 수율 - Anode */}
                    <tr>
                      <td className={styles.subTypeLabel} style={{ borderBottom: '2px solid #9ca3af' }}>
                        Anode
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayData = vdDailyDataMap[day];
                        return (
                          <td key={day} style={{ color: '#10b981', fontWeight: 600, borderBottom: '2px solid #9ca3af' }}>
                            {dayData?.anodeYield !== null && dayData?.anodeYield !== undefined
                              ? `${dayData.anodeYield.toFixed(1)}%`
                              : ''}
                          </td>
                        );
                      })}
                      <td style={{ color: '#10b981', fontWeight: 600, borderBottom: '2px solid #9ca3af' }}>
                        {vdData.total.anode.totalYield !== null ? `${vdData.total.anode.totalYield}%` : ''}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              }

              // Forming 공정은 특별하게 렌더링 (Cutting, Forming, Folding, Top Cutting 분리 - 9행: 생산량4 + NG4 + 수율1)
              if (isFormingProcess(processKey) && isFormingProcessData(processData)) {
                const formingData = processData as FormingProcessData;

                // yield 데이터 매핑
                const yieldDataMap: Record<number, number | null> = {};
                formingData.yield.data.forEach(item => {
                  yieldDataMap[item.day] = item.yield;
                });

                return (
                  <React.Fragment key={processKey}>
                    {/* 생산량 - 4개 서브타입 */}
                    {FORMING_SUBTYPES.map((subType, idx) => {
                      const subData = formingData[subType];
                      const subDailyDataMap: Record<number, FormingSubTypeDayData> = {};
                      subData.data.forEach(item => {
                        subDailyDataMap[item.day] = item;
                      });

                      if (idx === 0) {
                        // 첫 번째 서브타입 (Cutting) - 진행률과 목표수량은 1칸씩
                        return (
                          <tr key={`${processKey}-output-${subType}`}>
                            <td rowSpan={9} className={styles.processHeader}>
                              {processName}
                            </td>
                            <td rowSpan={4} className={styles.rowLabel}>
                              생산량({processUnit})
                            </td>
                            <td className={styles.subTypeLabel}>{FORMING_SUBTYPE_LABELS[subType]}</td>
                            {Array.from({ length: daysInMonth }, (_, i) => {
                              const day = i + 1;
                              const dayData = subDailyDataMap[day];
                              return <td key={day}>{dayData?.output || ''}</td>;
                            })}
                            <td>{subData.total.totalOutput}</td>
                            <td rowSpan={9} style={{ borderBottom: '2px solid #9ca3af' }}>
                              {formingData.progress !== null ? `${formingData.progress}%` : ''}
                            </td>
                            <td rowSpan={9} style={{ borderBottom: '2px solid #9ca3af' }}>
                              {formingData.targetQuantity !== null ? formingData.targetQuantity.toLocaleString() : ''}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={`${processKey}-output-${subType}`}>
                          <td className={styles.subTypeLabel}>{FORMING_SUBTYPE_LABELS[subType]}</td>
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dayData = subDailyDataMap[day];
                            return <td key={day}>{dayData?.output || ''}</td>;
                          })}
                          <td>{subData.total.totalOutput}</td>
                        </tr>
                      );
                    })}

                    {/* NG - 4개 서브타입 */}
                    {FORMING_SUBTYPES.map((subType, idx) => {
                      const subData = formingData[subType];
                      const subDailyDataMap: Record<number, FormingSubTypeDayData> = {};
                      subData.data.forEach(item => {
                        subDailyDataMap[item.day] = item;
                      });

                      if (idx === 0) {
                        return (
                          <tr key={`${processKey}-ng-${subType}`}>
                            <td rowSpan={4} className={styles.rowLabel}>
                              NG
                            </td>
                            <td className={styles.subTypeLabel}>{FORMING_SUBTYPE_LABELS[subType]}</td>
                            {Array.from({ length: daysInMonth }, (_, i) => {
                              const day = i + 1;
                              const dayData = subDailyDataMap[day];
                              return (
                                <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                                  {dayData?.ng !== null && dayData?.ng !== undefined ? dayData.ng : ''}
                                </td>
                              );
                            })}
                            <td style={{ color: '#ef4444', fontWeight: 500 }}>
                              {subData.total.totalNg !== null ? subData.total.totalNg : ''}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={`${processKey}-ng-${subType}`}>
                          <td className={styles.subTypeLabel}>{FORMING_SUBTYPE_LABELS[subType]}</td>
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dayData = subDailyDataMap[day];
                            return (
                              <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                                {dayData?.ng !== null && dayData?.ng !== undefined ? dayData.ng : ''}
                              </td>
                            );
                          })}
                          <td style={{ color: '#ef4444', fontWeight: 500 }}>
                            {subData.total.totalNg !== null ? subData.total.totalNg : ''}
                          </td>
                        </tr>
                      );
                    })}

                    {/* 수율 - 단일 행 (별도 yield 데이터 사용) */}
                    <tr key={`${processKey}-yield`}>
                      <td className={styles.rowLabel} colSpan={2} style={{ borderBottom: '2px solid #9ca3af' }}>
                        수율(%)
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const yieldValue = yieldDataMap[day];
                        return (
                          <td
                            key={day}
                            style={{
                              color: '#10b981',
                              fontWeight: 600,
                              borderBottom: '2px solid #9ca3af',
                            }}
                          >
                            {yieldValue !== null && yieldValue !== undefined
                              ? `${yieldValue.toFixed(1)}%`
                              : ''}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          color: '#10b981',
                          fontWeight: 600,
                          borderBottom: '2px solid #9ca3af',
                        }}
                      >
                        {formingData.yield.total !== null ? `${formingData.yield.total}%` : ''}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              }

              // Stacking 공정은 특별하게 렌더링 (NCR에 Hi pot, 무게, 두께, Alignment 하위항목)
              if (isStackingProcess(processKey) && isStackingProcessData(processData)) {
                const stackingData = processData as StackingProcessData;

                // 일별 데이터 매핑
                const dailyDataMap: Record<number, StackingDayData> = {};
                stackingData.data.forEach(item => {
                  dailyDataMap[item.day] = item;
                });

                // 수율 계산 함수
                const calcYield = (output: number, ng: number | null) => {
                  if (output === 0 || ng === null) return null;
                  return ((output - ng) / output) * 100;
                };

                return (
                  <React.Fragment key={processKey}>
                    {/* 생산량 행 */}
                    <tr>
                      <td rowSpan={7} className={styles.processHeader}>
                        {processName}
                      </td>
                      <td className={styles.rowLabel} colSpan={2}>
                        생산량({processUnit})
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayData = dailyDataMap[day];
                        return <td key={day}>{dayData?.output || ''}</td>;
                      })}
                      <td>{stackingData.total.totalOutput}</td>
                      <td rowSpan={7} style={{ borderBottom: '2px solid #9ca3af' }}>
                        {stackingData.total.progress !== null ? `${stackingData.total.progress}%` : ''}
                      </td>
                      <td rowSpan={7} style={{ borderBottom: '2px solid #9ca3af' }}>
                        {stackingData.total.targetQuantity !== null ? stackingData.total.targetQuantity.toLocaleString() : ''}
                      </td>
                    </tr>

                    {/* NG 행 (NCR과 분리) */}
                    <tr>
                      <td className={styles.rowLabel} colSpan={2}>
                        NG
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayData = dailyDataMap[day];
                        return (
                          <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                            {dayData?.ng !== null && dayData?.ng !== undefined ? dayData.ng : ''}
                          </td>
                        );
                      })}
                      <td style={{ color: '#ef4444', fontWeight: 500 }}>
                        {stackingData.total.totalNg !== null ? stackingData.total.totalNg : ''}
                      </td>
                    </tr>

                    {/* NCR 서브타입 행들 (Hi pot, 무게, 두께, Alignment) */}
                    {STACKING_NCR_SUBTYPES.map((subType, idx) => {
                      if (idx === 0) {
                        return (
                          <tr key={`${processKey}-ncr-${subType}`}>
                            <td rowSpan={4} className={styles.rowLabel}>
                              NCR
                            </td>
                            <td className={styles.subTypeLabel}>{STACKING_NCR_SUBTYPE_LABELS[subType]}</td>
                            {Array.from({ length: daysInMonth }, (_, i) => {
                              const day = i + 1;
                              const dayData = dailyDataMap[day];
                              const value = dayData?.ncr?.[subType] ?? null;
                              return (
                                <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                                  {value !== null && value !== undefined ? value : ''}
                                </td>
                              );
                            })}
                            <td style={{ color: '#ef4444', fontWeight: 500 }}>
                              {stackingData.total.ncr?.[subType] ?? ''}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={`${processKey}-ncr-${subType}`}>
                          <td className={styles.subTypeLabel}>{STACKING_NCR_SUBTYPE_LABELS[subType]}</td>
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dayData = dailyDataMap[day];
                            const value = dayData?.ncr?.[subType] ?? null;
                            return (
                              <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                                {value !== null && value !== undefined ? value : ''}
                              </td>
                            );
                          })}
                          <td style={{ color: '#ef4444', fontWeight: 500 }}>
                            {stackingData.total.ncr?.[subType] ?? ''}
                          </td>
                        </tr>
                      );
                    })}

                    {/* 수율 행 */}
                    <tr>
                      <td className={styles.rowLabel} colSpan={2} style={{ borderBottom: '2px solid #9ca3af' }}>
                        수율(%)
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayData = dailyDataMap[day];
                        const yieldValue = calcYield(dayData?.output || 0, dayData?.ng ?? null);
                        return (
                          <td
                            key={day}
                            style={{
                              color: '#10b981',
                              fontWeight: 600,
                              borderBottom: '2px solid #9ca3af',
                            }}
                          >
                            {yieldValue !== null ? `${yieldValue.toFixed(1)}%` : ''}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          color: '#10b981',
                          fontWeight: 600,
                          borderBottom: '2px solid #9ca3af',
                        }}
                      >
                        {stackingData.total.totalYield !== null ? `${stackingData.total.totalYield}%` : ''}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              }

              // 일반 공정 렌더링
              const normalProcessData = processData as ProcessData;
              const dailyDataMap: Record<number, DayData> = {};
              normalProcessData.data.forEach(item => {
                dailyDataMap[item.day] = item;
              });

              // NG와 수율 합계 계산
              const totalNG = normalProcessData.data.reduce((sum, item) => sum + (item.ng || 0), 0);
              const averageYield =
                normalProcessData.total.totalOutput > 0
                  ? ((normalProcessData.total.totalOutput - totalNG) / normalProcessData.total.totalOutput) * 100
                  : 0;

              // Mixing과 Coating Single만 회색 배경 적용
              const shouldApplyGrayBg = processKey === 'mixing' || processKey === 'coatingSingle';

              return (
                <React.Fragment key={processKey}>
                  {/* 생산량 행 */}
                  <tr>
                    <td rowSpan={3} className={styles.processHeader}>
                      {processName}
                    </td>
                    <td className={styles.rowLabel} colSpan={hasSubTypeProcess ? 2 : 1}>
                      생산량({processUnit})
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const dayData = dailyDataMap[day];
                      return <td key={day}>{dayData?.output || ''}</td>;
                    })}
                    <td>{normalProcessData.total.totalOutput}</td>
                    <td rowSpan={3} style={{ borderBottom: '2px solid #9ca3af' }}>
                      {normalProcessData.total.progress !== null ? `${normalProcessData.total.progress}%` : ''}
                    </td>
                    <td rowSpan={3} style={{ borderBottom: '2px solid #9ca3af' }}>
                      {normalProcessData.total.targetQuantity !== null ? normalProcessData.total.targetQuantity.toLocaleString() : ''}
                    </td>
                  </tr>

                  {/* NG 행 */}
                  <tr>
                    <td className={styles.rowLabel} colSpan={hasSubTypeProcess ? 2 : 1}>
                      NG
                    </td>
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
                  <tr>
                    <td
                      className={styles.rowLabel}
                      colSpan={hasSubTypeProcess ? 2 : 1}
                      style={{ borderBottom: '2px solid #9ca3af' }}
                    >
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
                </React.Fragment>
              );
            })}

            {/* 전체 합계 행 */}
            <tr className={styles.totalRow}>
              <td colSpan={daysInMonth + (hasSubTypeProcess ? 4 : 3)}>합계</td>
              <td className={styles.yieldCell}>
                {(() => {
                  // 전체 수율 계산 (전체 생산량 - 전체 NG) / 전체 생산량 * 100
                  const totalOutput = processesToRender.reduce((sum, [key, processData]) => {
                    if (!processData) return sum;
                    if (isVDProcess(key) && isVDProcessData(processData)) {
                      const vd = processData as VDProcessData;
                      return sum + vd.total.cathode.totalOutput + vd.total.anode.totalOutput;
                    }
                    if (isFormingProcess(key) && isFormingProcessData(processData)) {
                      const forming = processData as FormingProcessData;
                      return sum + FORMING_SUBTYPES.reduce((s, subType) => s + forming[subType].total.totalOutput, 0);
                    }
                    if (isStackingProcess(key) && isStackingProcessData(processData)) {
                      const stacking = processData as StackingProcessData;
                      return sum + stacking.total.totalOutput;
                    }
                    return sum + ((processData as ProcessData).total.totalOutput || 0);
                  }, 0);
                  const totalNG = processesToRender.reduce((sum, [key, processData]) => {
                    if (!processData) return sum;
                    if (isVDProcess(key) && isVDProcessData(processData)) {
                      const vd = processData as VDProcessData;
                      return sum + (vd.total.cathode.totalNg || 0) + (vd.total.anode.totalNg || 0);
                    }
                    if (isFormingProcess(key) && isFormingProcessData(processData)) {
                      const forming = processData as FormingProcessData;
                      return sum + FORMING_SUBTYPES.reduce((s, subType) => s + (forming[subType].total.totalNg || 0), 0);
                    }
                    if (isStackingProcess(key) && isStackingProcessData(processData)) {
                      const stacking = processData as StackingProcessData;
                      return sum + (stacking.total.totalNg || 0);
                    }
                    return sum + ((processData as ProcessData).total.totalNg || 0);
                  }, 0);
                  const overallYield = totalOutput > 0 ? ((totalOutput - totalNG) / totalOutput) * 100 : 0;
                  return `${overallYield.toFixed(1)}%`;
                })()}
              </td>
              <td>
                {(() => {
                  // 전체 진행률 계산
                  const totalOutput = processesToRender.reduce((sum, [key, processData]) => {
                    if (!processData) return sum;
                    if (isVDProcess(key) && isVDProcessData(processData)) {
                      const vd = processData as VDProcessData;
                      return sum + vd.total.cathode.totalOutput + vd.total.anode.totalOutput;
                    }
                    if (isFormingProcess(key) && isFormingProcessData(processData)) {
                      const forming = processData as FormingProcessData;
                      return sum + FORMING_SUBTYPES.reduce((s, subType) => s + forming[subType].total.totalOutput, 0);
                    }
                    if (isStackingProcess(key) && isStackingProcessData(processData)) {
                      const stacking = processData as StackingProcessData;
                      return sum + stacking.total.totalOutput;
                    }
                    return sum + ((processData as ProcessData).total.totalOutput || 0);
                  }, 0);
                  const totalTarget = processesToRender.reduce((sum, [key, processData]) => {
                    if (!processData) return sum;
                    if (isVDProcess(key) && isVDProcessData(processData)) {
                      const vd = processData as VDProcessData;
                      return sum + (vd.total.cathode.targetQuantity || 0) + (vd.total.anode.targetQuantity || 0);
                    }
                    if (isFormingProcess(key) && isFormingProcessData(processData)) {
                      const forming = processData as FormingProcessData;
                      return sum + (forming.targetQuantity || 0);
                    }
                    if (isStackingProcess(key) && isStackingProcessData(processData)) {
                      const stacking = processData as StackingProcessData;
                      return sum + (stacking.total.targetQuantity || 0);
                    }
                    return sum + ((processData as ProcessData).total.targetQuantity || 0);
                  }, 0);
                  return totalTarget > 0 ? `${((totalOutput / totalTarget) * 100).toFixed(1)}%` : '';
                })()}
              </td>
            </tr>
          </tbody>
        </table>
    </div>
  );
}
