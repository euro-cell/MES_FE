import { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { getAllProductions, getProductionPlan, createProduction } from './dashboardService';
import type { Project, ProjectPlan } from './types';
import { renderProcessChart } from './chartUtils';
import DashboardProjectList from './DashboardProjectList';
import DashboardProgress from './DashboardProgress';
import DashboardRegister from './DashboardRegister';
import DashboardSchedule from './DashboardSchedule';

// ✅ 공통 FormState 타입 (DashboardRegister와 일치시킴)
interface FormState {
  company: string;
  mode: string;
  year: number;
  month: number;
  round: number;
  batteryType: string;
  capacity: string | number;
}

export default function DashboardContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [plans, setPlans] = useState<{ project: Project; plan: ProjectPlan | null }[]>([]);
  const [chart, setChart] = useState<Chart | null>(null);
  const [progress, setProgress] = useState({
    electrode: '-',
    assembly: '-',
    formation: '-',
  });

  // 🔹 등록 폼 상태
  const [form, setForm] = useState<FormState>({
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

  /** ✅ Chart 렌더링 */
  const renderChart = (projectName: string) => {
    const data = processData[projectName];
    if (!data) return;
    if (chart) chart.destroy();

    const { newChart, progressData } = renderProcessChart('processChart', projectName, data);
    setChart(newChart);
    setProgress(progressData);
  };

  /** ✅ 프로젝트 목록 불러오기 */
  const fetchProjects = async () => {
    try {
      const data = await getAllProductions();
      setProjects(data);
    } catch (err) {
      console.error('프로젝트 목록 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /** ✅ 프로젝트 플랜 불러오기 */
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const results = await Promise.all(
          projects.map(async p => {
            const plan = await getProductionPlan(p.id);
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

  return (
    <section className='dashboard'>
      {/* ✅ 상단 3개 영역 */}
      <div className='top-section'>
        <DashboardProjectList processData={processData} projects={projects} renderChart={renderChart} />
        <DashboardProgress progress={progress} />
        <DashboardRegister form={form} setForm={setForm} onSubmit={createProduction} refreshProjects={fetchProjects} />
      </div>

      {/* ✅ 하단 프로젝트 스케줄 */}
      <DashboardSchedule plans={plans} />
    </section>
  );
}
