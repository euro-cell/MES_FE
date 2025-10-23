import { useEffect, useState } from 'react';
import axios from 'axios';
import { getWeekOfMonth, getWeeksBetween } from './dateUtils';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ProductionPlan {
  id: number;
  startDate: string;
  endDate: string;
  [key: string]: any;
}

interface ProcessRow {
  group: string;
  name: string;
  type?: string | null;
  key: string;
  hasElectrode: boolean;
  value?: string;
}

export default function ProductionView({ productionId }: { productionId: number }) {
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [processRows, setProcessRows] = useState<ProcessRow[]>([]);
  const [weeks, setWeeks] = useState<{ month: number; weeks: number[] }[]>([]);

  /** 🔹 공정 리스트 (등록 폼과 동일 구조) */
  const processList = [
    {
      group: 'Electrode',
      items: [
        { name: 'Slurry Mixing', types: ['Cathode', 'Anode'] },
        { name: 'Coating', types: ['Cathode', 'Anode'] },
        { name: 'Calendering', types: ['Cathode', 'Anode'] },
        { name: 'Notching', types: ['Cathode', 'Anode'] },
      ],
    },
    {
      group: 'Cell Assembly',
      items: [
        { name: 'Pouch Forming', types: [] },
        { name: 'Vacuum Drying', types: ['Cathode', 'Anode'] },
        { name: 'Stacking', types: [] },
        { name: 'Tab Welding', types: [] },
        { name: 'Sealing', types: [] },
        { name: 'E/L Filling', types: [] },
      ],
    },
    {
      group: 'Cell Formation',
      items: [
        { name: 'PF/MF', types: [] },
        { name: 'Grading', types: [] },
      ],
    },
  ];

  /** 🔹 병합 데이터 계산용 */
  const generateProcessTable = (planData: ProductionPlan): ProcessRow[] => {
    const rows: ProcessRow[] = [];
    processList.forEach(group => {
      group.items.forEach(item => {
        if (item.types.length === 0) {
          rows.push({
            group: group.group,
            name: item.name,
            type: null,
            key: `${group.group}_${item.name}`,
            hasElectrode: false,
            value: planData[mapToField(group.group, item.name)],
          });
        } else {
          item.types.forEach(type => {
            rows.push({
              group: group.group,
              name: item.name,
              type,
              key: `${group.group}_${item.name}_${type}`,
              hasElectrode: true,
              value: planData[mapToField(group.group, item.name, type)],
            });
          });
        }
      });
    });
    return rows;
  };

  /** 🔹 DB 필드명 매핑 */
  const mapToField = (group: string, name: string, type?: string | null): string => {
    const base = {
      Electrode: {
        'Slurry Mixing': { Cathode: 'mixingCathode', Anode: 'mixingAnode' },
        Coating: { Cathode: 'coatingCathode', Anode: 'coatingAnode' },
        Calendering: { Cathode: 'calenderingCathode', Anode: 'calenderingAnode' },
        Notching: { Cathode: 'notchingCathode', Anode: 'notchingAnode' },
      },
      'Cell Assembly': {
        'Pouch Forming': 'pouchForming',
        'Vacuum Drying': { Cathode: 'vacuumDryingCathode', Anode: 'vacuumDryingAnode' },
        Stacking: 'stacking',
        'Tab Welding': 'tabWelding',
        Sealing: 'sealing',
        'E/L Filling': 'elFilling',
      },
      'Cell Formation': {
        'PF/MF': 'pfMf',
        Grading: 'grading',
      },
    } as const;

    const g = base[group as keyof typeof base];
    const item = g?.[name as keyof typeof g];
    if (typeof item === 'string') return item;
    if (type && item && typeof item === 'object') return item[type as keyof typeof item];
    return '';
  };

  /** 🔹 주차 계산 (일요일~토요일 기준) */
  const getWeeksBetweenRange = (start: Date, end: Date) => {
    const result: { month: number; week: number }[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const month = cur.getMonth() + 1;
      const week = getWeekOfMonth(cur);
      if (!result.find(r => r.month === month && r.week === week)) {
        result.push({ month, week });
      }
      cur.setDate(cur.getDate() + 1);
    }
    return result;
  };

  /** 🔹 전체 주차 범위 계산 (테이블 헤더용) */
  const computeHeaderWeeks = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const allWeeks = getWeeksBetweenRange(s, e);
    const grouped: Record<number, number[]> = {};
    allWeeks.forEach(({ month, week }) => {
      if (!grouped[month]) grouped[month] = [];
      if (!grouped[month].includes(week)) grouped[month].push(week);
    });
    return Object.entries(grouped).map(([m, ws]) => ({
      month: Number(m),
      weeks: ws.sort((a, b) => a - b),
    }));
  };

  /** 🔹 API 데이터 불러오기 */
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await axios.get(`${API_BASE}/production/${productionId}/plan`);
        const planData = res.data[0];
        setPlan(planData);
        setWeeks(computeHeaderWeeks(planData.startDate, planData.endDate));
        setProcessRows(generateProcessTable(planData));
      } catch (err) {
        console.error('📛 생산계획 조회 실패:', err);
      }
    };
    fetchPlan();
  }, [productionId]);

  /** 🔹 각 셀 색상 계산용 (기간 내 주차 포함 여부 판단) */
  const isInRange = (value: string | undefined, month: number, week: number) => {
    if (!value) return false;
    const [start, end] = value.includes('~') ? value.split('~') : [value, value];
    const s = new Date(start);
    const e = new Date(end);
    const weeksInRange = getWeeksBetween(s, e);
    return weeksInRange.some(r => r.month === month && r.week === week);
  };

  /** 🔹 병합 계산 (대공정 / 공정명 병합용) */
  const getRowSpans = () => {
    const spans: Record<number, { groupSpan: number; nameSpan: number }> = {};
    let i = 0;
    while (i < processRows.length) {
      const currentGroup = processRows[i].group;
      const sameGroup = processRows.filter(r => r.group === currentGroup);
      const groupCount = sameGroup.length;
      let j = 0;
      while (j < sameGroup.length) {
        const currentName = sameGroup[j].name;
        const sameName = sameGroup.filter(r => r.name === currentName);
        const nameCount = sameName.length;
        const startIndex = processRows.findIndex(
          r => r.group === currentGroup && r.name === currentName && r.type === sameName[0].type
        );
        spans[startIndex] = { groupSpan: 0, nameSpan: nameCount };
        if (j === 0) spans[startIndex].groupSpan = groupCount;
        j += nameCount;
      }
      i += groupCount;
    }
    return spans;
  };

  const spans = getRowSpans();

  if (!plan) return <p>📦 데이터를 불러오는 중...</p>;

  return (
    <div className='production-view'>
      <h3>📊 생산 일정 조회</h3>

      <table className='production-temp-table'>
        <thead>
          <tr>
            <th colSpan={3}>Process</th>
            {weeks.map(m => (
              <th key={m.month} colSpan={m.weeks.length}>
                {m.month}월
              </th>
            ))}
          </tr>
          <tr>
            <th>대공정</th>
            <th>공정명</th>
            <th>전극</th>
            {weeks.flatMap(m => m.weeks.map(w => <th key={`${m.month}-${w}`}>{w}w</th>))}
          </tr>
        </thead>
        <tbody>
          {processRows.map((row, index) => {
            const span = spans[index] || { groupSpan: 0, nameSpan: 0 };
            return (
              <tr key={row.key}>
                {/* 대공정 병합 */}
                {span.groupSpan > 0 && <td rowSpan={span.groupSpan}>{row.group}</td>}

                {/* 공정명 병합 */}
                {row.hasElectrode ? (
                  span.nameSpan > 0 && <td rowSpan={span.nameSpan}>{row.name}</td>
                ) : (
                  <td colSpan={2}>{row.name}</td>
                )}

                {/* 전극 */}
                {row.hasElectrode && <td>{row.type}</td>}

                {/* 주차 데이터 */}
                {weeks.flatMap(m =>
                  m.weeks.map(w => (
                    <td
                      key={`${row.key}-${m.month}-${w}`}
                      className={isInRange(row.value, m.month, w) ? 'cell-active' : ''}
                    >
                      {isInRange(row.value, m.month, w) ? '■' : ''}
                    </td>
                  ))
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
