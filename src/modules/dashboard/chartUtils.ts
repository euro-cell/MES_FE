import Chart from 'chart.js/auto';
import type { ProductionProgressResponse } from './types';

export function renderProcessChart(canvasId: string, projectName: string, data: ProductionProgressResponse) {
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!ctx) {
    return {
      newChart: null,
      progressData: { electrode: '-', assembly: '-', formation: '-' },
    };
  }

  const avg = Math.round(data.overall);

  const newChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['진행률', '남은'],
      datasets: [
        {
          data: [avg, 100 - avg],
          backgroundColor: ['#5dade2', '#e5e5e5'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
    } as any,
  });

  const centerEl = document.getElementById('chart-center-text');
  if (centerEl) centerEl.textContent = `${avg}%`;

  const titleEl = document.getElementById('chart-title');
  if (titleEl) titleEl.textContent = `${projectName} 총 진행률 (${avg}%)`;

  return {
    newChart,
    progressData: {
      electrode: `${data.electrode.toFixed(2)}%`,
      assembly: `${data.assembly.toFixed(2)}%`,
      formation: `${data.formation.toFixed(2)}%`,
    },
  };
}
