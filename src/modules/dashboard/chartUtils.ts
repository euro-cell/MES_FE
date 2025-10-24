import Chart from 'chart.js/auto';

export function renderProcessChart(canvasId: string, projectName: string, data: any) {
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!ctx) {
    return {
      newChart: null,
      progressData: { electrode: '-', assembly: '-', formation: '-' },
    };
  }

  const avg = Math.round((data.전극 + data.조립 + data.화성) / 3);

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
      electrode: `${data.전극}%`,
      assembly: `${data.조립}%`,
      formation: `${data.화성}%`,
    },
  };
}
