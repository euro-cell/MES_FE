import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { MeasurementRow } from './CoatingMeasurementTable';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface RChartProps {
  data: MeasurementRow[];
}

export default function RChart({ data }: RChartProps) {
  const valid = data.filter(row => row.measurements.some(v => v !== null));

  if (valid.length === 0) return null;

  const labels = valid.map(row => String(row.rowIndex));

  const yMin = 0;
  const yMax = 0.7;
  const yTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'R',
        data: valid.map(d => d.r),
        borderColor: '#993300',
        backgroundColor: '#993300',
        borderWidth: 1,
        pointStyle: 'rectRot' as const, // 다이아몬드
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0,
      },
      {
        label: 'CL',
        data: valid.map(d => d.r_cl),
        borderColor: '#339966',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      },
      {
        label: 'UCL',
        data: valid.map(d => d.r_ucl),
        borderColor: '#FF0000',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      },
      {
        label: 'LCL',
        data: valid.map(d => d.r_lcl),
        borderColor: '#FF0000',
        backgroundColor: '#FF0000',
        borderWidth: 2,
        pointStyle: 'rect' as const, // 사각형
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 20, right: 20 } },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { usePointStyle: true, pointStyle: 'line' as const },
      },
      title: {
        display: true,
        text: 'R Chart',
        font: { size: 14 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(4)}`,
        },
      },
    },
    scales: {
      x: {
        offset: true,
        title: { display: true, text: '군번호' },
      },
      y: {
        min: yMin,
        max: yMax,
        afterBuildTicks: (axis: { ticks: { value: number }[] }) => {
          axis.ticks = yTicks.map(v => ({ value: v }));
        },
        ticks: {
          callback: (value: number | string) => Number(value).toFixed(1),
        },
        title: { display: true, text: 'R' },
      },
    },
  };

  return (
    <div className={styles.tableSection}>
      <div style={{ height: 270 }}>
        <Line data={chartData} options={options as Parameters<typeof Line>[0]['options']} />
      </div>
    </div>
  );
}
