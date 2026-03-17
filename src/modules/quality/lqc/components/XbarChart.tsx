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

interface XbarChartProps {
  data: MeasurementRow[];
}

export default function XbarChart({ data }: XbarChartProps) {
  const valid = data.filter(row => row.measurements.some(v => v !== null));

  if (valid.length === 0) return null;

  const labels = valid.map(row => String(row.rowIndex));

  const yMin = valid[0]?.lsl ?? 24.13;
  const yMax = valid[0]?.usl ?? 25.13;
  const tickCount = Math.round((yMax - yMin) / 0.25) + 1;
  const yTicks = Array.from({ length: tickCount }, (_, i) =>
    parseFloat((yMin + i * 0.25).toFixed(2))
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Xbar',
        data: valid.map(d => d.xbar),
        borderColor: '#993300',
        backgroundColor: '#993300',
        borderWidth: 1,
        pointStyle: 'rectRot', // 다이아몬드
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0,
      },
      {
        label: 'CL',
        data: valid.map(d => d.xbar_cl),
        borderColor: '#339966',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      },
      {
        label: 'UCL',
        data: valid.map(d => d.xbar_ucl),
        borderColor: '#FF0000',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      },
      {
        label: 'LCL',
        data: valid.map(d => d.xbar_lcl),
        borderColor: '#FF0000',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      },
      {
        label: 'USL',
        data: valid.map(d => d.usl),
        borderColor: '#0000FF',
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      },
      {
        label: 'LSL',
        data: valid.map(d => d.lsl),
        borderColor: '#0000FF',
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 20, right: 20 } },
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, pointStyle: 'line' } },
      title: {
        display: true,
        text: 'Xbar Chart _ Cathode Coating',
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
        ticks: {
          callback: (value: number | string) => Number(value).toFixed(2),
          // Chart.js afterBuildTicks로 고정 틱 설정
        },
        afterBuildTicks: (axis: { ticks: { value: number }[] }) => {
          axis.ticks = yTicks.map(v => ({ value: v }));
        },
        title: { display: true, text: 'Loading (mg/㎠)' },
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
