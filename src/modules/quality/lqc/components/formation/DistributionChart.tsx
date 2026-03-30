import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Annotation from 'chartjs-plugin-annotation';
import { Scatter } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Annotation);

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
  uslColor?: string;
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
  uslColor = '#FF0000',
}: DistributionChartProps) {
  const dataMax = data.length > 0 ? Math.max(...data.map(d => d.y)) : 0;
  const yMax = yMaxProp ?? Math.ceil(dataMax / yStep) * yStep + yStep;

  const xTickCount = Math.round((xMax - xMin) / xStep) + 1;
  const xTicks = Array.from({ length: xTickCount }, (_, i) => xMin + i * xStep);
  const yTickCount = Math.round((yMax - yMin) / yStep) + 1;
  const yTicks = Array.from({ length: yTickCount }, (_, i) =>
    parseFloat((yMin + i * yStep).toFixed(10))
  );

  const annotations: Record<string, object> = {};
  if (lsl !== undefined) {
    annotations['lsl'] = {
      type: 'line',
      scaleID: 'x',
      value: lsl,
      borderColor: '#0000FF',
      borderWidth: 1.5,
      borderDash: [6, 3],
      label: {
        display: true,
        content: 'LSL',
        position: 'start',
        backgroundColor: 'transparent',
        color: '#0000FF',
        font: { size: 11, weight: 'bold' },
      },
    };
  }
  if (usl !== undefined) {
    annotations['usl'] = {
      type: 'line',
      scaleID: 'x',
      value: usl,
      borderColor: uslColor,
      borderWidth: 1.5,
      borderDash: [6, 3],
      label: {
        display: true,
        content: 'USL',
        position: 'start',
        backgroundColor: 'transparent',
        color: uslColor,
        font: { size: 11, weight: 'bold' },
      },
    };
  }

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
        pointHoverRadius: 4,
      },
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
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx: TooltipItem<'scatter'>) =>
            `(${ctx.parsed.x}, ${ctx.parsed.y ?? 0})`,
        },
      },
      annotation: { annotations },
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
    <div style={{ height: 320, width: '100%' }}>
      <Scatter data={chartData} options={{ ...options, responsive: true, maintainAspectRatio: false }} />
    </div>
  );
}
