import { format, startOfMonth, endOfMonth, addWeeks, startOfWeek, endOfWeek } from 'date-fns';

export interface WeekData {
  year: number;
  month: number;
  label: string;
  start: Date;
  end: Date;
}

export const PROCESS_CONFIG = [
  {
    name: 'Electrode',
    details: [
      { name: 'Slurry Mixing', sub: ['Cathode', 'Anode'], fields: ['mixing_cathode', 'mixing_anode'] },
      { name: 'Coating', sub: ['Cathode', 'Anode'], fields: ['coating_cathode', 'coating_anode'] },
      { name: 'Calendering', sub: ['Cathode', 'Anode'], fields: ['calendering_cathode', 'calendering_anode'] },
      { name: 'Notching', sub: ['Cathode', 'Anode'], fields: ['notching_cathode', 'notching_anode'] },
    ],
  },
  {
    name: 'Cell Assembly',
    details: [
      { name: 'Pouch Forming', sub: [], fields: ['pouch_forming'] },
      { name: 'Vacuum Drying', sub: ['Cathode', 'Anode'], fields: ['vacuum_drying_cathode', 'vacuum_drying_anode'] },
      { name: 'Stacking', sub: [], fields: ['stacking'] },
      { name: 'Tab Welding', sub: [], fields: ['tab_welding'] },
      { name: 'Sealing', sub: [], fields: ['sealing'] },
      { name: 'E/L Filling', sub: [], fields: ['el_filling'] },
    ],
  },
  {
    name: 'Cell Formation',
    details: [
      { name: 'PF/MF', sub: [], fields: ['pf_mf'] },
      { name: 'Grading', sub: [], fields: ['grading'] },
    ],
  },
];

export function getProcessRowSpan(proc: any): number {
  return proc.details.reduce((sum: number, d: any) => sum + (d.sub.length || 1), 0);
}

export function parseISODate(value: string): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const [y, m, d] = trimmed.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatWeekHeader(label: string): string {
  const match = label.match(/(\d+)주차$/);
  return match ? `${match[1]}w` : label;
}

/* ✅ 월 기준 주차 계산 (월요일 시작) */
export function buildScheduleTable(plan: any) {
  const startDate = parseISODate(plan.startDate) || new Date(plan.startDate);
  const endDate = parseISODate(plan.endDate) || new Date(plan.endDate);

  // ✅ 월별로 주차 생성 (일요일 기준, 월 범위를 넘어가지 않도록)
  const weeks: WeekData[] = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const monthStart = startOfMonth(current);
    const monthEnd = endOfMonth(current);
    const monthNum = current.getMonth() + 1;
    const year = current.getFullYear();

    // 해당 월의 첫 번째 일요일 찾기 (또는 1일이 속한 주의 일요일)
    let weekStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
    let weekIndex = 1;

    // 해당 월의 모든 주 생성
    while (weekStart <= monthEnd) {
      let weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });

      // ✅ 주의 끝이 다음 달로 넘어가면 해당 월의 마지막 날까지만
      if (weekEnd > monthEnd) {
        weekEnd = new Date(monthEnd);
      }

      // 해당 주가 현재 월에 속하는지 확인 (일부라도 겹치면 포함)
      if (weekEnd >= monthStart && weekStart <= monthEnd) {
        weeks.push({
          year: year,
          month: monthNum,
          label: `${monthNum}월 ${weekIndex}주차`,
          start: weekStart > monthStart ? new Date(weekStart) : new Date(monthStart),
          end: new Date(weekEnd),
        });
        weekIndex++;
      }

      weekStart = addWeeks(weekStart, 1);
    }

    // 다음 달로
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }

  // endDate 이후의 주 제거
  const filteredWeeks = weeks.filter(w => w.start <= endDate);

  // ✅ 날짜 범위에 해당하는 주차에 값 표시 (병합용, 월 넘김 처리)
  function getWeekCellValues(raw: string): string[] {
    if (!raw) return filteredWeeks.map(() => '');
    const trimmed = raw.trim();

    let start: Date | null = null;
    let end: Date | null = null;

    if (trimmed.includes('~')) {
      const [s, e] = trimmed.split('~').map(x => x.trim());
      start = parseISODate(s);
      end = parseISODate(e);
    } else {
      start = parseISODate(trimmed);
      end = parseISODate(trimmed);
    }

    if (!start || !end) return filteredWeeks.map(() => '');
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // ✅ 시작일과 종료일의 월이 다른지 확인
    const startMonth = start.getMonth() + 1;
    const endMonth = end.getMonth() + 1;
    const crossMonth = startMonth !== endMonth;

    // ✅ 전체 기간을 하나의 값으로 표시 (월이 다르면 월도 표기)
    let displayValue = '';
    if (start.toDateString() === end.toDateString()) {
      displayValue = crossMonth ? `${startMonth}/${format(start, 'dd')}` : format(start, 'dd');
    } else {
      if (crossMonth) {
        displayValue = `${startMonth}/${format(start, 'dd')}-${endMonth}/${format(end, 'dd')}`;
      } else {
        displayValue = `${format(start, 'dd')}-${format(end, 'dd')}`;
      }
    }

    return filteredWeeks.map((w: WeekData) => {
      const ws = new Date(w.start);
      const we = new Date(w.end);
      ws.setHours(0, 0, 0, 0);
      we.setHours(23, 59, 59, 999);

      // ✅ 기간이 해당 주와 겹치면 동일한 값 반환 (자동 병합됨)
      if (end >= ws && start <= we) {
        return displayValue;
      }
      return '';
    });
  }

  function renderCells(vals: string[]): string {
    let html = '';
    let i = 0;
    while (i < vals.length) {
      const v = vals[i];
      if (!v) {
        html += '<td class="week-cell"></td>';
        i++;
        continue;
      }
      let span = 1;
      // ✅ 연속된 동일한 값은 병합
      while (i + span < vals.length && vals[i + span] === v) span++;
      html += `<td class="week-cell filled" colspan="${span}">${v}</td>`;
      i += span;
    }
    return html;
  }

  // ✅ 월별 그룹화 (헤더용)
  const months: Record<string, WeekData[]> = {};
  filteredWeeks.forEach(w => {
    const key = `${w.year}-${w.month}`;
    if (!months[key]) months[key] = [];
    months[key].push(w);
  });

  // ✅ 테이블 HTML 생성
  let html = '<table class="plan-table plan-table-view"><thead><tr><th colspan="3">Process</th>';

  Object.keys(months).forEach(k => {
    const monthNum = months[k][0].month;
    html += `<th colspan="${months[k].length}">${monthNum}월</th>`;
  });
  html += '</tr><tr><th>Process</th><th>Detail</th><th>Sub</th>';

  Object.values(months).forEach(ws => ws.forEach((w: WeekData) => (html += `<th>${formatWeekHeader(w.label)}</th>`)));
  html += '</tr></thead><tbody>';

  PROCESS_CONFIG.forEach(proc => {
    const prSpan = getProcessRowSpan(proc);
    proc.details.forEach((d: any, di: number) => {
      if (d.sub.length) {
        d.sub.forEach((s: string, si: number) => {
          html += '<tr>';
          if (di === 0 && si === 0) html += `<td rowspan="${prSpan}" class="process-header">${proc.name}</td>`;
          if (si === 0) html += `<td rowspan="${d.sub.length}" class="detail-cell">${d.name}</td>`;
          html += `<td>${s}</td>`;
          html += renderCells(getWeekCellValues(plan[d.fields[si]]));
          html += '</tr>';
        });
      } else {
        html += '<tr>';
        if (di === 0) html += `<td rowspan="${prSpan}" class="process-header">${proc.name}</td>`;
        html += `<td>${d.name}</td><td></td>`;
        html += renderCells(getWeekCellValues(plan[d.fields[0]]));
        html += '</tr>';
      }
    });
  });

  html += '</tbody></table>';
  return { html };
}
