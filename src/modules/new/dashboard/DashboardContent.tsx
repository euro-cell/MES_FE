import { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { renderProcessChart } from './chartUtils';
import { getAllProductions } from './dashboardService';
import type { DashboardProject, DashboardProcessRaw, DashboardProgressData } from './types';
import DashboardSummary from './DashboardSummary';

export default function DashboardContent() {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [chart, setChart] = useState<Chart | null>(null);
  const [progress, setProgress] = useState<DashboardProgressData>({ electrode: '-', assembly: '-', formation: '-' });
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

  return (
    <div className='dashboard-content'>
      {' '}
      <div className='dashboard-top'>
        {' '}
        <DashboardSummary processData={processData} projects={projects} onSelectProject={renderChart} />{' '}
      </div>{' '}
    </div>
  );
}
