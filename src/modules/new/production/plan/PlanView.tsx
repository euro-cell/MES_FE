import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProductionPlan } from './PlanService';
import { exportHtmlTableToExcel } from './exportExcel';
import { getWeekOfMonth } from './dateUtils';
import styles from '../../../../styles/production/plan/PlanView.module.css';

interface ProcessRow {
  group: string;
  name: string;
  type?: string | null;
  key: string;
  hasElectrode: boolean;
  value?: string;
}

export default function PlanView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const project = state?.project;
  const productionId = project?.id;

  const [plan, setPlan] = useState<any | null>(null);
  const [processRows, setProcessRows] = useState<ProcessRow[]>([]);
  const [weeks, setWeeks] = useState<{ month: number; weeks: number[] }[]>([]);
  const tableRef = useRef<HTMLTableElement>(null);

  /** ✅ 공정 리스트 */
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

  /** ✅ 필드 매핑 */
  const mapToField = (group: string, name: string, type?: string | null): string => {
    const map = {
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

    const g = map[group as keyof typeof map];
    const item = g?.[name as keyof typeof g];
    if (typeof item === 'string') return item;
    if (type && item && typeof item === 'object') return item[type as keyof typeof item];
    return '';
  };

  /** ✅ 주차 계산 */
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

  /** ✅ 주차 헤더 */
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

  /** ✅ 날짜 범위를 주차별 셀로 변환 (병합 포함) */
  const getMergedRanges = (value: string | undefined, year: number, weeks: { month: number; weeks: number[] }[]) => {
    if (!value) {
      return weeks.flatMap(m =>
        m.weeks.map(w => ({
          key: `${m.month}-${w}`,
          colSpan: 1,
          text: '',
          active: false,
        }))
      );
    }

    const [startStr, endStr] = value.includes('~') ? value.split('~') : [value, value];
    const s = new Date(startStr);
    const e = new Date(endStr);

    const allWeeks = weeks.flatMap(m =>
      m.weeks.map(w => {
        const firstDay = new Date(year, m.month - 1, 1);
        const firstWeekday = firstDay.getDay();
        const weekStartDay = 1 + (w - 1) * 7 - firstWeekday;
        const startDate = new Date(year, m.month - 1, Math.max(1, weekStartDay));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const lastDay = new Date(year, m.month, 0).getDate();
        if (endDate.getDate() > lastDay) {
          endDate.setDate(lastDay);
        }

        const overlap = s <= endDate && e >= startDate;

        if (!overlap) {
          return { month: m.month, week: w, active: false, startDate, endDate };
        }

        return { month: m.month, week: w, active: true, startDate, endDate };
      })
    );

    const result = [];
    let i = 0;

    while (i < allWeeks.length) {
      const cur = allWeeks[i];

      if (!cur.active) {
        // 비활성 셀
        result.push({
          key: `${cur.month}-${cur.week}`,
          colSpan: 1,
          text: '',
          active: false,
        });
        i++;
        continue;
      }

      let span = 1;
      while (i + span < allWeeks.length && allWeeks[i + span].active) {
        span++;
      }

      const firstWeek = allWeeks[i];
      const lastWeek = allWeeks[i + span - 1];

      const rangeStart = new Date(Math.max(s.getTime(), firstWeek.startDate.getTime()));
      const rangeEnd = new Date(Math.min(e.getTime(), lastWeek.endDate.getTime()));

      const startDay = rangeStart.getDate();
      const endDay = rangeEnd.getDate();
      const text = startDay === endDay ? `${startDay}` : `${startDay}~${endDay}`;

      result.push({
        key: `${cur.month}-${cur.week}`,
        colSpan: span,
        text,
        active: true,
      });

      i += span;
    }

    return result;
  };

  /** ✅ 데이터 로드 */
  useEffect(() => {
    if (!productionId) return;
    getProductionPlan(productionId).then(res => {
      const planData = Array.isArray(res) ? res[0] : res;
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
    });
  }, [productionId]);

  if (!plan) return <p>📦 데이터를 불러오는 중...</p>;

  return (
    <div className={styles.planView}>
      <div className={styles.header}>
        <h3>📊 생산 일정 조회 - {project?.name}</h3>
        <div className={styles.actions}>
          <button
            onClick={() => exportHtmlTableToExcel(tableRef.current!.outerHTML, project?.name || 'Schedule')}
            className={styles.excelBtn}
          >
            📥 엑셀 다운로드
          </button>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            ← 목록으로
          </button>
        </div>
      </div>

      <table ref={tableRef} className={styles.planTable}>
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
            const merged = getMergedRanges(row.value, plan.production?.year || new Date().getFullYear(), weeks);
            return (
              <tr key={row.key}>
                {idx === 0 || processRows[idx - 1].group !== row.group ? (
                  <td rowSpan={processRows.filter(r => r.group === row.group).length}>{row.group}</td>
                ) : null}
                {row.hasElectrode ? (
                  idx === 0 || processRows[idx - 1].name !== row.name ? (
                    <td rowSpan={processRows.filter(r => r.name === row.name && r.group === row.group).length}>
                      {row.name}
                    </td>
                  ) : null
                ) : (
                  <td colSpan={2}>{row.name}</td>
                )}
                {row.hasElectrode && <td>{row.type}</td>}
                {merged.map(cell => (
                  <td
                    key={cell.key}
                    colSpan={cell.colSpan}
                    className={cell.active ? styles.cellActive : styles.cellEmpty}
                  >
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
