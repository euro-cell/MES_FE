import { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { renderProcessChart } from './chartUtils';
import { getAllProductions, getProductionPlan, createProduction } from './dashboardService';
import type {
  DashboardProject,
  DashboardProcessRaw,
  DashboardProgressData,
  DashboardFormState,
  DashboardProjectPlan,
} from './types';
import DashboardSummary from './DashboardSummary';
import DashboardProgress from './DashboardProgress';
import DashboardProjectManager from './DashboardProjectManager';
import DashboardSchedule from './DashboardSchedule';

export default function DashboardContent() {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [plans, setPlans] = useState<{ project: DashboardProject; plan: DashboardProjectPlan | null }[]>([]);
  const [chart, setChart] = useState<Chart | null>(null);
  const [progress, setProgress] = useState<DashboardProgressData>({
    electrode: '-',
    assembly: '-',
    formation: '-',
  });

  const [form, setForm] = useState<DashboardFormState>({
    company: '',
    mode: '',
    year: new Date().getFullYear(),
    month: 1,
    round: 1,
    batteryType: '',
    capacity: '',
    targetQuantity: 0,
  });

  const processData: Record<string, DashboardProcessRaw> = {
    'A 프로젝트': { 전극: 50, 조립: 20, 화성: 80 },
    'B 프로젝트': { 전극: 70, 조립: 40, 화성: 50 },
    'C 프로젝트': { 전극: 30, 조립: 60, 화성: 10 },
    'D 프로젝트': { 전극: 60, 조립: 30, 화성: 40 },
  };

  const renderChart = (projectName: string) => {
    const data = processData[projectName];
    if (!data) return;
    if (chart) chart.destroy();
    const { newChart, progressData } = renderProcessChart('processChart', projectName, data);
    setChart(newChart);
    setProgress(progressData);
  };

  const fetchProjectsAndPlans = async () => {
    try {
      const prods = await getAllProductions();
      const planData = await Promise.all(
        prods.map(async p => {
          const plan = await getProductionPlan(p.id);
          return { project: p, plan };
        })
      );
      setProjects(prods);
      setPlans(planData);
    } catch (err) {
      console.error('프로젝트 및 계획 로드 실패:', err);
    }
  };

  useEffect(() => {
    fetchProjectsAndPlans();
  }, []);

  return (
    <div className='dashboard-content'>
      <div className='dashboard-top'>
        <DashboardSummary processData={processData} projects={projects} onSelectProject={renderChart} />
        <DashboardProgress progress={progress} />
        <DashboardProjectManager
          form={form}
          setForm={setForm}
          onSubmit={createProduction}
          refreshProjects={fetchProjectsAndPlans}
          projects={projects}
        />
      </div>

      <div className='dashboard-bottom'>
        <DashboardSchedule plans={plans} />
      </div>
    </div>
  );
}
