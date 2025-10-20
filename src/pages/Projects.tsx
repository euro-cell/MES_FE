import React, { useEffect, useState } from 'react';
import { startOfMonth, endOfMonth, eachWeekOfInterval, addMonths, format } from 'date-fns';
import * as XLSX from 'xlsx';
import '../styles/project.css';

/* -----------------------------
   📘 타입 정의
------------------------------ */
interface Project {
  id: number;
  name: string;
  company: string;
  mode: string;
  year: number;
  month: number;
  round: number;
  batteryType: string;
  capacity: number;
}

interface WeekData {
  year: number;
  month: number;
  label: string;
  start: Date;
  end: Date;
}

/* -----------------------------
   📘 공정 설정 (원래 JS의 PROCESS_CONFIG)
------------------------------ */
const PROCESS_CONFIG = [
  {
    name: 'Electrode',
    details: [
      { name: 'Slurry Mixing', sub: ['Cathode', 'Anode'] },
      { name: 'Coating', sub: ['Cathode', 'Anode'] },
      { name: 'Calendering', sub: ['Cathode', 'Anode'] },
      { name: 'Notching', sub: ['Cathode', 'Anode'] },
    ],
  },
  {
    name: 'Cell Assembly',
    details: [
      { name: 'Pouch Forming', sub: [] },
      { name: 'Vacuum Drying', sub: ['Cathode', 'Anode'] },
      { name: 'Stacking', sub: [] },
      { name: 'Tab Welding', sub: [] },
      { name: 'Sealing', sub: [] },
      { name: 'E/L Filling', sub: [] },
    ],
  },
  {
    name: 'Cell Formation',
    details: [
      { name: 'PF/MF', sub: [] },
      { name: 'Grading', sub: [] },
    ],
  },
];

/* -----------------------------
   📘 유틸 함수
------------------------------ */
function getProcessRowSpan(proc: any) {
  return proc.details.reduce((sum: number, d: any) => sum + (d.sub.length || 1), 0);
}

function parseISODate(value: string) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

/* -----------------------------
   📘 React Component
------------------------------ */
export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [plan, setPlan] = useState({ startDate: '', endDate: '' });
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [groupedWeeks, setGroupedWeeks] = useState<
    { year: number; month: number; startWeek: number; endWeek: number }[]
  >([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewHtml, setViewHtml] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  /* ✅ 프로젝트 목록 불러오기 */
  useEffect(() => {
    fetch('http://127.0.0.1:8080/project')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  /* ✅ 주차 계산 함수 */
  const getWeeksByRange = (start: string, end: string): WeekData[] => {
    const startDate = parseISODate(start) || new Date(start);
    const endDate = parseISODate(end) || new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const result: WeekData[] = [];

    while (current <= endDate) {
      const monthStart = startOfMonth(current);
      const monthEnd = endOfMonth(current);
      const monthWeeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });

      monthWeeks.forEach((weekStart: Date, idx: number) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        result.push({
          year: current.getFullYear(),
          month: current.getMonth() + 1,
          label: `${current.getMonth() + 1}월 ${idx + 1}주차`,
          start: weekStart,
          end: weekEnd,
        });
      });

      current = addMonths(current, 1);
    }
    return result;
  };

  /* ✅ 프로젝트 삭제 */
  const deleteProject = async (id: number, name: string) => {
    if (!window.confirm(`${name} 프로젝트를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8080/project/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      alert('삭제되었습니다.');
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('삭제 중 오류 발생');
    }
  };

  /* ✅ 일정 등록 모달 열기 */
  const openPlanModal = (project: Project) => {
    setSelectedProject(project);
    setPlan({ startDate: '', endDate: '' });
    setWeeks([]);
    setGroupedWeeks([]);
    setShowPlanModal(true);
  };

  /* ✅ 일정 조회 모달 열기 */
  const openViewModal = async (project: Project) => {
    setSelectedProject(project);
    setShowViewModal(true);
    setViewHtml('📡 데이터를 불러오는 중...');
    try {
      const res = await fetch(`http://127.0.0.1:8080/projects/${project.id}/plan/search`);
      if (!res.ok) throw new Error('조회 실패');
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setViewHtml('<p>등록된 일정이 없습니다.</p>');
        return;
      }

      const schedule = data[0];
      let html = `<table class="plan-table"><thead><tr><th>공정명</th><th>시작일</th><th>종료일</th></tr></thead><tbody>`;
      Object.entries(schedule).forEach(([key, value]) => {
        if (['id', 'startDate', 'endDate', 'projectId'].includes(key)) return;
        html += `<tr><td>${key}</td><td colspan="2">${value || '-'}</td></tr>`;
      });
      html += `</tbody></table>`;
      setViewHtml(html);
    } catch {
      setViewHtml('<p style="color:red;">조회 중 오류 발생</p>');
    }
  };

  /* ✅ 기간 적용 (월별 병합형 헤더 생성) */
  const generateWeeks = () => {
    if (!plan.startDate || !plan.endDate) {
      alert('시작일과 종료일을 입력하세요.');
      return;
    }

    const w = getWeeksByRange(plan.startDate, plan.endDate);
    const grouped: { year: number; month: number; startWeek: number; endWeek: number }[] = [];
    let currentMonth = w[0]?.month;
    let currentYear = w[0]?.year;
    let startWeek = 1;
    let weekCount = 0;

    w.forEach((week, i) => {
      weekCount++;
      const next = w[i + 1];
      if (!next || next.month !== currentMonth) {
        grouped.push({
          year: currentYear!,
          month: currentMonth!,
          startWeek,
          endWeek: weekCount,
        });
        currentMonth = next?.month;
        currentYear = next?.year;
        startWeek = 1;
        weekCount = 0;
      }
    });

    setWeeks(w);
    setGroupedWeeks(grouped);
  };

  /* ✅ 일정 저장 */
  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const payload = {
      projectId: selectedProject.id,
      startDate: plan.startDate,
      endDate: plan.endDate,
    };

    try {
      const res = await fetch(`http://127.0.0.1:8080/projects/${selectedProject.id}/plan/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      alert(data.message || '등록 완료');
      setShowPlanModal(false);
    } catch {
      alert('저장 중 오류 발생');
    }
  };

  /* ✅ 엑셀 다운로드 */
  const downloadExcel = () => {
    if (!selectedProject) return;
    setDownloading(true);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Project', 'Start', 'End'],
      [selectedProject.name, plan.startDate, plan.endDate],
      [],
      ['Weeks'],
      ...weeks.map(w => [
        `${w.month}월 ${w.label.split(' ')[1]}`,
        `${format(w.start, 'MM.dd')}~${format(w.end, 'MM.dd')}`,
      ]),
    ]);

    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
    XLSX.writeFile(wb, `${selectedProject.name}_생산일정.xlsx`);
    setDownloading(false);
  };

  /* -----------------------------
     📘 UI 렌더링
  ------------------------------ */
  return (
    <div className='project-page'>
      <h1>프로젝트 관리</h1>

      {loading ? (
        <p>📡 데이터를 불러오는 중...</p>
      ) : (
        <>
          <h2>프로젝트 목록</h2>
          <table className='table-list'>
            <thead>
              <tr>
                <th>ID</th>
                <th>프로젝트명</th>
                <th>회사</th>
                <th>유형</th>
                <th>년도</th>
                <th>월</th>
                <th>회차</th>
                <th>전지 타입</th>
                <th>용량</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {projects.length ? (
                projects.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.company}</td>
                    <td>{p.mode}</td>
                    <td>{p.year}</td>
                    <td>{p.month}</td>
                    <td>{p.round}</td>
                    <td>{p.batteryType}</td>
                    <td>{p.capacity}</td>
                    <td>
                      <button className='open-plan-modal' onClick={() => openPlanModal(p)}>
                        등록
                      </button>
                      <button className='open-view-modal' onClick={() => openViewModal(p)}>
                        조회
                      </button>
                      <button className='delete-project' onClick={() => deleteProject(p.id, p.name)}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10}>등록된 프로젝트가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* ✅ 일정 등록 모달 */}
      {showPlanModal && selectedProject && (
        <div className='modal'>
          <div className='modal-content'>
            <span className='close' onClick={() => setShowPlanModal(false)}>
              &times;
            </span>
            <h2>{selectedProject.name} 일정 등록</h2>

            <form onSubmit={savePlan}>
              <div className='form-group'>
                <label>시작일:</label>
                <input
                  type='date'
                  value={plan.startDate}
                  onChange={e => setPlan({ ...plan, startDate: e.target.value })}
                  required
                />
              </div>
              <div className='form-group'>
                <label>종료일:</label>
                <input
                  type='date'
                  value={plan.endDate}
                  onChange={e => setPlan({ ...plan, endDate: e.target.value })}
                  required
                />
              </div>

              <button type='button' className='primary' onClick={generateWeeks}>
                기간 적용
              </button>

              {groupedWeeks.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <table className='plan-table'>
                    <thead>
                      <tr>
                        <th>Process</th>
                        <th>Detail</th>
                        <th>Sub</th>
                        {groupedWeeks.map((m, i) => (
                          <th key={i}>
                            {m.month}월 ({m.startWeek}주차~{m.endWeek}주차)
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PROCESS_CONFIG.map(proc => (
                        <React.Fragment key={proc.name}>
                          {proc.details.map((detail, dIdx) =>
                            detail.sub.length ? (
                              detail.sub.map((sub, sIdx) => (
                                <tr key={proc.name + detail.name + sub}>
                                  {dIdx === 0 && sIdx === 0 && (
                                    <td rowSpan={getProcessRowSpan(proc)} className='process-header'>
                                      {proc.name}
                                    </td>
                                  )}
                                  {sIdx === 0 && (
                                    <td rowSpan={detail.sub.length} className='detail-cell'>
                                      {detail.name}
                                    </td>
                                  )}
                                  <td className='sub-cell'>{sub}</td>
                                  {/* ✅ 월이 여러 개여도 한 쌍만 */}
                                  <td colSpan={groupedWeeks.length}>
                                    <input type='date' style={{ width: '45%' }} /> ~{' '}
                                    <input type='date' style={{ width: '45%' }} />
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr key={proc.name + detail.name}>
                                {dIdx === 0 && (
                                  <td rowSpan={getProcessRowSpan(proc)} className='process-header'>
                                    {proc.name}
                                  </td>
                                )}
                                <td className='detail-cell'>{detail.name}</td>
                                <td className='sub-cell'></td>
                                <td colSpan={groupedWeeks.length}>
                                  <input type='date' style={{ width: '45%' }} /> ~{' '}
                                  <input type='date' style={{ width: '45%' }} />
                                </td>
                              </tr>
                            )
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button type='submit' className='primary' style={{ marginTop: 20 }}>
                저장
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ 일정 조회 모달 */}
      {showViewModal && selectedProject && (
        <div className='modal'>
          <div className='modal-content'>
            <span className='close' onClick={() => setShowViewModal(false)}>
              &times;
            </span>
            <div className='modal-header'>
              <h2>{selectedProject.name} 일정 조회</h2>
              <button className='download-button' onClick={downloadExcel} disabled={downloading}>
                {downloading ? '다운로드 중...' : '엑셀 다운로드'}
              </button>
            </div>
            <div id='viewResultContainer' dangerouslySetInnerHTML={{ __html: viewHtml }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
