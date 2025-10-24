import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export const renderProcessChart = (
  elementId: string,
  projectName: string,
  data: { 전극: number; 조립: number; 화성: number }
) => {
  const avg = Math.round((data.전극 + data.조립 + data.화성) / 3);
  const ctx = document.getElementById(elementId) as HTMLCanvasElement;

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

  const progressData = {
    electrode: `${data.전극}%`,
    assembly: `${data.조립}%`,
    formation: `${data.화성}%`,
  };

  return { newChart, progressData };
};
