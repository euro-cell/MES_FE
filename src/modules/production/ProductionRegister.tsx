import React, { useState } from 'react';
import { startOfMonth, endOfMonth, eachWeekOfInterval, addMonths } from 'date-fns';
import { PROCESS_CONFIG, getProcessRowSpan, parseISODate } from './processUtils';
import type { WeekData } from './processUtils';

export default function ProjectRegister({ project, onClose }: { project: any; onClose: () => void }) {
  const [form, setForm] = useState({ startDate: '', endDate: '' });
  const [tableHtml, setTableHtml] = useState('');

  /* ✅ 주차 계산 함수 */
  function getWeeksByRange(start: string, end: string): WeekData[] {
    const startDate = parseISODate(start) || new Date(start);
    const endDate = parseISODate(end) || new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const weeks: WeekData[] = [];

    while (current <= endDate) {
      const monthStart = startOfMonth(current);
      const monthEnd = endOfMonth(current);
      const monthWeeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });
      monthWeeks.forEach((weekStart: Date, idx: number) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weeks.push({
          year: current.getFullYear(),
          month: current.getMonth() + 1,
          label: `${current.getMonth() + 1}월 ${idx + 1}주차`,
          start: weekStart,
          end: weekEnd,
        });
      });
      current = addMonths(current, 1);
    }
    return weeks;
  }

  const generateWeeks = () => {
    const { startDate, endDate } = form;
    if (!startDate || !endDate) return alert('시작일과 종료일을 입력하세요.');
    const weeks = getWeeksByRange(startDate, endDate);
    if (!weeks.length) return;

    const monthGroups: Record<string, WeekData[]> = {};
    weeks.forEach(w => {
      const key = `${w.year}-${w.month}`;
      if (!monthGroups[key]) monthGroups[key] = [];
      monthGroups[key].push(w);
    });

    const sorted = Object.keys(monthGroups)
      .map(k => {
        const [y, m] = k.split('-').map(Number);
        return { year: y, month: m, key: k };
      })
      .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year));

    let html = '<table class="plan-table"><thead><tr><th>Process</th><th>Detail</th><th>Sub</th>';
    sorted.forEach(({ key, month }) => {
      const g = monthGroups[key];
      const first = g[0].label.split(' ')[1];
      const last = g[g.length - 1].label.split(' ')[1];
      html += `<th>${month}월 (${first}~${last})</th>`;
    });
    html += '</tr></thead><tbody>';

    PROCESS_CONFIG.forEach(proc => {
      const rowSpan = getProcessRowSpan(proc);
      proc.details.forEach((d, dIdx) => {
        if (d.sub.length) {
          d.sub.forEach((sub, sIdx) => {
            html += '<tr>';
            if (dIdx === 0 && sIdx === 0) html += `<td rowspan="${rowSpan}" class="process-header">${proc.name}</td>`;
            if (sIdx === 0) html += `<td rowspan="${d.sub.length}" class="detail-cell">${d.name}</td>`;
            html += `<td>${sub}</td><td colspan="${sorted.length}">
              <input type="date" class="start" data-field="${d.fields[sIdx] || ''}" /> ~
              <input type="date" class="end" data-field="${d.fields[sIdx] || ''}" />
            </td></tr>`;
          });
        } else {
          html += '<tr>';
          if (dIdx === 0) html += `<td rowspan="${rowSpan}" class="process-header">${proc.name}</td>`;
          html += `<td>${d.name}</td><td></td><td colspan="${sorted.length}">
            <input type="date" class="start" data-field="${d.fields[0]}" /> ~
            <input type="date" class="end" data-field="${d.fields[0]}" />
          </td></tr>`;
        }
      });
    });

    html += '</tbody></table>';
    setTableHtml(html);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { startDate: form.startDate, endDate: form.endDate };

    document.querySelectorAll('.plan-table input.start').forEach(input => {
      const field = (input as HTMLInputElement).dataset.field;
      const start = (input as HTMLInputElement).value;
      const end = (input.parentElement?.querySelector('input.end') as HTMLInputElement)?.value;
      if (field && (start || end)) payload[field] = `${start}${end ? `~${end}` : ''}`;
    });

    await fetch(`http://192.168.0.22:8080/projects/${project.id}/plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    alert('등록 완료');
    onClose();
  };

  return (
    <div className='modal'>
      <div className='modal-content'>
        <span className='close' onClick={onClose}>
          &times;
        </span>
        <h2>{project.name} 일정 등록</h2>

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>시작일:</label>
            <input type='date' value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div className='form-group'>
            <label>종료일:</label>
            <input type='date' value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>

          <button type='button' className='secondary' onClick={generateWeeks}>
            기간 적용
          </button>
          <div dangerouslySetInnerHTML={{ __html: tableHtml }} />
          <button type='submit' className='primary' style={{ marginTop: '20px' }}>
            저장
          </button>
        </form>
      </div>
    </div>
  );
}
