import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Chart from 'chart.js/auto';
import { renderProcessChart } from './chartUtils';
import { createProduction, getProductionProgress } from './dashboardService';
import { useDashboardProjects } from './useDashboardQueries';
import type { DashboardProject, DashboardProgressData, DashboardFormState } from './types';
import DashboardSummary from './DashboardSummary';
import DashboardProgress from './DashboardProgress';
import DashboardProjectManager from './DashboardProjectManager';
import DashboardSchedule from './DashboardSchedule';
import styles from '../../styles/dashboard/layout.module.css';

export default function DashboardContent() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useDashboardProjects();

  const projects = data?.projects ?? [];
  const plans = data?.plans ?? [];

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
      setProgress({
        electrode: '-',
        assembly: '-',
        formation: '-',
      });
    }
  };

  const refreshProjects = async () => {
    await queryClient.invalidateQueries({ queryKey: ['dashboard', 'projects'] });
  };

  if (isLoading) {
    return <div className={styles.dashboardContent}>로딩 중...</div>;
  }

  return (
    <div className={styles.dashboardContent}>
      <div className={styles.dashboardTop}>
        <DashboardSummary projects={projects} onSelectProject={renderChart} />
        <DashboardProgress progress={progress} />
        <DashboardProjectManager
          form={form}
          setForm={setForm}
          onSubmit={createProduction}
          refreshProjects={refreshProjects}
          projects={projects}
        />
      </div>

      <div className={styles.dashboardBottom}>
        <DashboardSchedule plans={plans} />
      </div>
    </div>
  );
}
