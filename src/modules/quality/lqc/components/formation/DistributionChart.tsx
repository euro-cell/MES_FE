import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface DistributionPoint {
  x: number;
  y: number;
}

interface DistributionChartProps {
  title: string;
  data: DistributionPoint[];
  xMin: number;
  xMax: number;
  xStep: number;
  yMin: number;
  yMax?: number;
  yStep: number;
  yLabel: string;
  xLabel?: string;
  lsl?: number;
  usl?: number;
}

export default function DistributionChart({
  title,
  data,
  xMin,
  xMax,
  xStep,
  yMin,
  yMax: yMaxProp,
  yStep,
  yLabel,
  xLabel = '용량(Ah)',
  lsl,
  usl,
}: DistributionChartProps) {
  const dataMax = data.length > 0 ? Math.max(...data.map(d => d.y)) : 0;
  const yMax = yMaxProp ?? Math.ceil(dataMax / yStep) * yStep + yStep;

  const xTickCount = Math.round((xMax - xMin) / xStep) + 1;
  const xTicks = Array.from({ length: xTickCount }, (_, i) => xMin + i * xStep);
  const yTickCount = Math.round((yMax - yMin) / yStep) + 1;
  const yTicks = Array.from({ length: yTickCount }, (_, i) =>
    parseFloat((yMin + i * yStep).toFixed(10))
  );

  const chartData = {
    datasets: [
      {
        data,
        borderColor: '#C00000',
        borderWidth: 1,
        backgroundColor: 'transparent',
        showLine: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
      ...(lsl !== undefined ? [{
        label: 'Lower Spec Limit',
        data: [{ x: lsl, y: yMin }, { x: lsl, y: yMax }],
        borderColor: '#0000FF',
        borderWidth: 1.5,
        borderDash: [6, 3],
        backgroundColor: 'transparent',
        showLine: true,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      }] : []),
      ...(usl !== undefined ? [{
        label: 'Upper Spec Limit',
        data: [{ x: usl, y: yMin }, { x: usl, y: yMax }],
        borderColor: '#FF0000',
        borderWidth: 1.5,
        borderDash: [6, 3],
        backgroundColor: 'transparent',
        showLine: true,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        font: { size: 13 },
      },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: xMin,
        max: xMax,
        afterBuildTicks: (axis: { ticks: { value: number }[] }) => {
          axis.ticks = xTicks.map(v => ({ value: v }));
        },
        title: { display: true, text: xLabel },
      },
      y: {
        min: yMin,
        max: yMax,
        afterBuildTicks: (axis: { ticks: { value: number }[] }) => {
          axis.ticks = yTicks.map(v => ({ value: v }));
        },
        title: { display: true, text: yLabel },
      },
    },
  };

  return (
    <div style={{ height: 320 }}>
      {(lsl !== undefined || usl !== undefined) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4, justifyContent: 'center' }}>
          {lsl !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="30" height="10">
                <line x1="0" y1="5" x2="30" y2="5" stroke="#0000FF" strokeWidth="1.5" strokeDasharray="6,3" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 'bold', color: '#0000FF' }}>LSL</span>
            </div>
          )}
          {usl !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="30" height="10">
                <line x1="0" y1="5" x2="30" y2="5" stroke="#FF0000" strokeWidth="1.5" strokeDasharray="6,3" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 'bold', color: '#FF0000' }}>USL</span>
            </div>
          )}
        </div>
      )}
      <Scatter data={chartData} options={options} />
    </div>
  );
}
