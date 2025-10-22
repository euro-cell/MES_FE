import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import '../../styles/dashboard.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Project {
  id: number;
  name: string;
}

interface ProjectPlan {
  startDate: string;
  endDate?: string;
}

export default function DashboardContent() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [plans, setPlans] = useState<{ project: Project; plan: ProjectPlan | null }[]>([]);
  const [chart, setChart] = useState<Chart | null>(null);
  const [progress, setProgress] = useState({
    electrode: '-',
    assembly: '-',
    formation: '-',
  });

  // 🔹 등록 폼 상태
  const [form, setForm] = useState({
    company: '',
    mode: '',
    year: 2025,
    month: 1,
    round: 1,
    batteryType: '',
    capacity: '',
  });

  // 🔹 샘플 공정 데이터
  const processData: Record<string, { 전극: number; 조립: number; 화성: number }> = {
    'A 프로젝트': { 전극: 50, 조립: 20, 화성: 80 },
    'B 프로젝트': { 전극: 70, 조립: 40, 화성: 50 },
    'C 프로젝트': { 전극: 30, 조립: 60, 화성: 10 },
    'D 프로젝트': { 전극: 60, 조립: 30, 화성: 40 },
  };

  // ✅ 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ✅ 프로젝트 등록 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/production`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('등록 실패');
      alert('프로젝트 등록 완료 ✅');

      // ✅ 등록 후 목록 새로고침
      await fetchProjects();
      setForm({
        company: '',
        mode: '',
        year: 2025,
        month: 1,
        round: 1,
        batteryType: '',
        capacity: '',
      });
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  // ✅ 프로젝트 목록 불러오기
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/production`, { credentials: 'include' });
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('프로젝트 목록 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ 프로젝트 플랜 불러오기
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const results = await Promise.all(
          projects.map(async p => {
            const res = await fetch(`${API_BASE}/production/${p.id}/plan`, { credentials: 'include' });
            if (!res.ok) return { project: p, plan: null };
            const plans = await res.json();
            const plan = Array.isArray(plans) && plans.length ? plans[plans.length - 1] : null;
            return { project: p, plan };
          })
        );
        setPlans(results);
      } catch (err) {
        console.error('프로젝트 일정 불러오기 실패:', err);
      }
    };

    if (projects.length > 0) loadPlans();
  }, [projects]);

  // ✅ Chart 렌더링
  const renderChart = (projectName: string) => {
    const data = processData[projectName];
    if (!data) return;

    const avg = Math.round((data.전극 + data.조립 + data.화성) / 3);
    const ctx = document.getElementById('processChart') as HTMLCanvasElement;
    if (chart) chart.destroy();

    const newChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['진행률', '남은'],
        datasets: [
          {
            data: [avg, 100 - avg],
            backgroundColor: ['#5dade2', '#e5e5e5'],
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
          title: { display: true, text: `${projectName} 총 진행률 (${avg}%)` },
          datalabels: {
            color: '#000',
            font: { weight: 'bold', size: 14 },
            formatter: (value: number, context: any) => {
              const label = context.chart.data.labels?.[context.dataIndex] as string;
              return label === '남은' ? '' : value + '%';
            },
          },
        },
        cutout: '65%' as any,
      } as any,
      plugins: [ChartDataLabels],
    });

    setChart(newChart);
    setProgress({
      electrode: `${data.전극}%`,
      assembly: `${data.조립}%`,
      formation: `${data.화성}%`,
    });
  };

  // ✅ 유틸 - 날짜 포맷
  const formatDate = (d?: string) => {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return `${date.getMonth() + 1}.${date.getDate()}`;
  };

  // ✅ 유틸 - 월별 막대 위치 계산
  const calculateTimelineBar = (startDate?: string, endDate?: string) => {
    if (!startDate) return { start: 1, span: 1 };

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    const startMonth = Math.max(1, Math.min(12, start.getMonth() + 1));
    let endMonth = Math.max(1, Math.min(12, end.getMonth() + 1));

    // 다른 해로 넘어가는 경우는 12월로 고정
    if (end.getFullYear() > start.getFullYear()) endMonth = 12;

    let span = endMonth - startMonth + 1;
    if (span < 1) span = 1;

    return { start: startMonth, span };
  };

  return (
    <section className='dashboard'>
      {/* ✅ 상단 3개 영역 */}
      <div className='top-section'>
        {/* 프로젝트 현황 */}
        <div className='project-list box'>
          <h3>프로젝트 현황</h3>
          <ul className='project-list__static'>
            {Object.keys(processData).map(p => (
              <li key={p} onClick={() => renderChart(p)}>
                {p}
              </li>
            ))}
          </ul>
          <ul className='project-list__dynamic'>
            {projects.length > 0 ? (
              projects.map(p => <li key={p.id}>{p.name}</li>)
            ) : (
              <li className='dynamic-project'>등록된 프로젝트가 없습니다.</li>
            )}
          </ul>
        </div>

        {/* 프로젝트 진행률 */}
        <div className='project-status box'>
          <h3>프로젝트 진행률</h3>
          <div className='project-progress'>
            <div className='total-progress'>
              <canvas id='processChart' width='220' height='220'></canvas>
            </div>
            <div className='process-list'>
              <div className='process-item'>
                <span className='label'>전극 공정</span>
                <span className='value'>{progress.electrode}</span>
              </div>
              <div className='process-item'>
                <span className='label'>조립 공정</span>
                <span className='value'>{progress.assembly}</span>
              </div>
              <div className='process-item'>
                <span className='label'>화성 공정</span>
                <span className='value'>{progress.formation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 프로젝트 등록 */}
        <div className='search box'>
          <h3>프로젝트 등록</h3>
          <form onSubmit={handleSubmit} className='project-form inline-form'>
            <div className='form-row'>
              <label>회사 약어</label>
              <input type='text' name='company' value={form.company} onChange={handleChange} placeholder='예: NA' />
            </div>
            <div className='form-row'>
              <label>회사 유형</label>
              <select name='mode' value={form.mode} onChange={handleChange}>
                <option value=''>선택</option>
                <option value='OME'>OME (E)</option>
                <option value='ODM'>ODM (D)</option>
              </select>
            </div>
            <div className='form-row'>
              <label>생산년도</label>
              <input type='number' name='year' value={form.year} onChange={handleChange} />
            </div>
            <div className='form-row'>
              <label>생산월</label>
              <select name='month' value={form.month} onChange={handleChange}>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}월
                  </option>
                ))}
              </select>
            </div>
            <div className='form-row'>
              <label>회차</label>
              <input type='number' name='round' value={form.round} onChange={handleChange} />
            </div>
            <div className='form-row'>
              <label>전지 타입</label>
              <input
                type='text'
                name='batteryType'
                value={form.batteryType}
                onChange={handleChange}
                placeholder='예: TNP'
              />
            </div>
            <div className='form-row'>
              <label>용량</label>
              <input type='number' name='capacity' value={form.capacity} onChange={handleChange} placeholder='예: 38' />
            </div>
            <button type='submit' className='create-project-btn'>
              등록하기
            </button>
          </form>
        </div>
      </div>

      {/* ✅ 하단 스케줄 */}
      <div className='bottom-section'>
        <div className='schedule box'>
          <h3>프로젝트 스케줄</h3>
          <div className='schedule-timeline'>
            <div className='schedule-grid schedule-header'>
              <div className='project-cell'>프로젝트</div>
              <div className='timeline-cell'>
                <div className='year-label'>2025</div>
                <div className='month-grid'>
                  {[...Array(12)].map((_, i) => (
                    <span key={i}>{i + 1}월</span>
                  ))}
                </div>
              </div>
              <div className='progress-cell'>진행률</div>
            </div>

            <div className='schedule-body'>
              {plans.length === 0 ? (
                <div className='timeline-message'>등록된 프로젝트가 없습니다.</div>
              ) : (
                plans.map(({ project, plan }) => {
                  const { start, span } = calculateTimelineBar(plan?.startDate, plan?.endDate);
                  return (
                    <div className='schedule-grid schedule-row' key={project.id}>
                      <div className='project-cell'>
                        <strong>{project.name}</strong>
                        <span className='date-range'>
                          {plan ? `${plan.startDate} ~ ${plan.endDate ?? '진행 중'}` : '일정 없음'}
                        </span>
                      </div>
                      <div className='timeline-cell'>
                        <div className='timeline-track'>
                          <div
                            className='timeline-bar'
                            style={
                              {
                                '--start': start,
                                '--span': span,
                              } as React.CSSProperties
                            }
                          >
                            <span className='bar-label'>{formatDate(plan?.startDate)}</span>
                            <span className='bar-label'>{plan?.endDate ? formatDate(plan.endDate) : '진행 중'}</span>
                          </div>
                        </div>
                      </div>
                      <div className='progress-cell'>
                        <span className='progress-value'>-</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
