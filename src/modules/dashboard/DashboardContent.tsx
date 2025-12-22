import { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { renderProcessChart } from './chartUtils';
import { getAllProductions, getProductionPlan, createProduction, getProductionProgress } from './dashboardService';
import type {
  DashboardProject,
  DashboardProgressData,
  DashboardFormState,
  DashboardProjectPlan,
  DashboardProjectWithPlan,
} from './types';
import DashboardSummary from './DashboardSummary';
import DashboardProgress from './DashboardProgress';
import DashboardProjectManager from './DashboardProjectManager';
import DashboardSchedule from './DashboardSchedule';
import styles from '../../styles/dashboard/layout.module.css';

export default function DashboardContent() {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [plans, setPlans] = useState<DashboardProjectWithPlan[]>([]);
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

  const renderChart = async (project: DashboardProject) => {
    try {
      if (chart) chart.destroy();
      const data = await getProductionProgress(project.id);
      const { newChart, progressData } = renderProcessChart('processChart', project.name, data);
      setChart(newChart);
      setProgress(progressData);
    } catch (err) {
      console.error('프로젝트 진행률 로드 실패:', err);
      // 에러 발생 시 기본값으로 설정
      setProgress({
        electrode: '-',
        assembly: '-',
        formation: '-',
      });
    }
  };

  const fetchProjectsAndPlans = async () => {
    try {
      const prods = await getAllProductions();
      const planData = await Promise.all(
        prods.map(async p => {
          const plan = await getProductionPlan(p.id);
          let progressValue: number | undefined;
          try {
            const progressData = await getProductionProgress(p.id);
            progressValue = progressData.overall;
          } catch {
            progressValue = undefined; // 진행률 로드 실패 시 undefined
          }
          return { project: p, plan, progress: progressValue };
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
    <div className={styles.dashboardContent}>
      <div className={styles.dashboardTop}>
        <DashboardSummary projects={projects} onSelectProject={renderChart} />
        <DashboardProgress progress={progress} />
        <DashboardProjectManager
          form={form}
          setForm={setForm}
          onSubmit={createProduction}
          refreshProjects={fetchProjectsAndPlans}
          projects={projects}
        />
      </div>

      <div className={styles.dashboardBottom}>
        <DashboardSchedule plans={plans} />
      </div>
    </div>
  );
}
