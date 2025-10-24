import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getWeekOfMonth } from './dateUtils';
import { exportHtmlTableToExcel } from './exportExcel';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ProductionPlan {
  id: number;
  startDate: string;
  endDate: string;
  production?: { id: number; name: string; year: number };
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
  const tableRef = useRef<HTMLTableElement>(null); // ✅ 테이블 참조

  /** 🔹 공정 리스트 */
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

  /** 🔹 주차 계산 */
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

  /** 🔹 주차별 날짜 계산 */
  const getWeekDateRange = (year: number, month: number, week: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const firstWeekday = firstDay.getDay();
    const startDay = 1 + (week - 1) * 7 - firstWeekday;
    const startDate = new Date(year, month - 1, startDay > 0 ? startDay : 1);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    if (endDate.getDate() > lastDayOfMonth) endDate.setDate(lastDayOfMonth);
    return { start: startDate, end: endDate };
  };

  /** 🔹 전체 주차 계산 (테이블 헤더용) */
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

  const getMergedRanges = (value: string | undefined, year: number, weeks: { month: number; weeks: number[] }[]) => {
    if (!value) return [];

    const [startStr, endStr] = value.includes('~') ? value.split('~') : [value, value];
    const s = new Date(startStr);
    const e = new Date(endStr);

    // ✅ 모든 주를 평탄화
    const allCells = weeks.flatMap(m =>
      m.weeks.map(w => {
        const range = getWeekDateRange(year, m.month, w);
        const overlapStart = s > range.start ? s : range.start;
        const overlapEnd = e < range.end ? e : range.end;

        if (overlapStart <= overlapEnd) {
          const startDay = overlapStart.getDate().toString().padStart(2, '0');
          const endDay = overlapEnd.getDate().toString().padStart(2, '0');
          return {
            key: `${m.month}-${w}`,
            month: m.month,
            week: w,
            text: startDay === endDay ? startDay : `${startDay}~${endDay}`,
            rangeStart: overlapStart,
            rangeEnd: overlapEnd,
          };
        }
        return {
          key: `${m.month}-${w}`,
          month: m.month,
          week: w,
          text: '',
          rangeStart: null,
          rangeEnd: null,
        } as {
          key: string;
          month: number;
          week: number;
          text: string;
          rangeStart: Date | null;
          rangeEnd: Date | null;
        };
      })
    );

    // ✅ 병합 처리 (null 안전 + 타입 강제)
    const merged: { key: string; colSpan: number; text: string }[] = [];
    let i = 0;

    while (i < allCells.length) {
      const cur = allCells[i];
      if (!cur.rangeStart || !cur.rangeEnd) {
        merged.push({ key: cur.key, colSpan: 1, text: '' });
        i++;
        continue;
      }

      let span = 1;
      let startDate: Date = new Date(cur.rangeStart);
      let endDate: Date = new Date(cur.rangeEnd);

      // 🔹 다음 주 시작 날짜가 endDate 다음날이면 병합
      while (
        i + span < allCells.length &&
        allCells[i + span].rangeStart !== null &&
        allCells[i + span].rangeEnd !== null &&
        (allCells[i + span].rangeStart!.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24) <= 1
      ) {
        endDate = new Date(allCells[i + span].rangeEnd!);
        span++;
      }

      const startDay = startDate.getDate().toString().padStart(2, '0');
      const endDay = endDate.getDate().toString().padStart(2, '0');

      merged.push({
        key: cur.key,
        colSpan: span,
        text: startDay === endDay ? startDay : `${startDay}~${endDay}`,
      });

      i += span;
    }

    return merged;
  };

  /** 🔹 데이터 로드 */
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await axios.get(`${API_BASE}/production/${productionId}/plan`);
        const planData = res.data[0];
        console.log('🚀 ~ planData:', planData);
        setPlan(planData);
        setWeeks(computeHeaderWeeks(planData.startDate, planData.endDate));

        const rows: ProcessRow[] = [];
        processList.forEach(g =>
          g.items.forEach(item => {
            if (item.types.length === 0) {
              rows.push({
                group: g.group,
                name: item.name,
                key: `${g.group}_${item.name}`,
                hasElectrode: false,
                value: planData[mapToField(g.group, item.name)],
              });
            } else {
              item.types.forEach(type =>
                rows.push({
                  group: g.group,
                  name: item.name,
                  type,
                  key: `${g.group}_${item.name}_${type}`,
                  hasElectrode: true,
                  value: planData[mapToField(g.group, item.name, type)],
                })
              );
            }
          })
        );
        setProcessRows(rows);
      } catch (err) {
        console.error('❌ 조회 실패:', err);
      }
    };
    fetchPlan();
  }, [productionId]);

  /** 🔹 그룹 병합 계산 */
  const getRowSpans = () => {
    const spans: Record<number, { groupSpan: number; nameSpan: number }> = {};
    let i = 0;
    while (i < processRows.length) {
      const group = processRows[i].group;
      const sameGroup = processRows.filter(r => r.group === group);
      const groupCount = sameGroup.length;
      let j = 0;
      while (j < sameGroup.length) {
        const name = sameGroup[j].name;
        const sameName = sameGroup.filter(r => r.name === name);
        const nameCount = sameName.length;
        const startIdx = processRows.findIndex(
          r => r.group === group && r.name === name && r.type === sameName[0].type
        );
        spans[startIdx] = { groupSpan: 0, nameSpan: nameCount };
        if (j === 0) spans[startIdx].groupSpan = groupCount;
        j += nameCount;
      }
      i += groupCount;
    }
    return spans;
  };

  const spans = getRowSpans();

  if (!plan) return <p>📦 데이터를 불러오는 중...</p>;

  const handleExportExcel = () => {
    if (!tableRef.current) return;
    exportHtmlTableToExcel(tableRef.current.outerHTML, `${plan.production?.name || '생산계획'}`);
  };

  return (
    <div className='production-view'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>📊 생산 일정 조회 ({plan.production?.name || 'Unknown Project'})</h3>
        <button
          onClick={handleExportExcel}
          style={{
            backgroundColor: '#198754',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          📥 엑셀 다운로드
        </button>
      </div>

      <table className='production-table' ref={tableRef}>
        <thead>
          <tr>
            <th rowSpan={2} colSpan={3}>
              Process
            </th>
            {weeks.map(m => (
              <th key={m.month} colSpan={m.weeks.length}>
                {m.month}월
              </th>
            ))}
          </tr>
          <tr>{weeks.flatMap(m => m.weeks.map(w => <th key={`${m.month}-${w}`}>{w}w</th>))}</tr>
        </thead>

        <tbody>
          {processRows.map((row, idx) => {
            const span = spans[idx] || { groupSpan: 0, nameSpan: 0 };
            const merged = getMergedRanges(row.value, plan.production?.year || new Date().getFullYear(), weeks);

            return (
              <tr key={row.key}>
                {span.groupSpan > 0 && <td rowSpan={span.groupSpan}>{row.group}</td>}
                {row.hasElectrode ? (
                  span.nameSpan > 0 && <td rowSpan={span.nameSpan}>{row.name}</td>
                ) : (
                  <td colSpan={2}>{row.name}</td>
                )}
                {row.hasElectrode && <td>{row.type}</td>}

                {merged.map(cell => (
                  <td key={cell.key} colSpan={cell.colSpan} className={cell.text ? 'cell-active' : ''}>
                    {cell.text}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
