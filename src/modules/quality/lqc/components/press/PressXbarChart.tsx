import { useState } from 'react';
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
import type { PressMeasurementRow } from './PressMeasurementTable';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PressXbarChartProps {
  data: PressMeasurementRow[];
}

export default function PressXbarChart({ data }: PressXbarChartProps) {
  const [expanded, setExpanded] = useState(false);

  const valid = data.filter(row => row.measurements.some(v => v !== null));
  if (valid.length === 0) return null;

  const labels = valid.map(row => String(row.rowIndex));

  const lsl = valid[0]?.lsl ?? 88;
  const usl = valid[0]?.usl ?? 94;
  const target = (usl + lsl) / 2;
  const tolerance = (usl - lsl) / 2;
  const dataValues = valid
    .flatMap(d => [d.xbar, d.xbar_cl, d.xbar_ucl, d.xbar_lcl])
    .filter((v): v is number => v !== null && !isNaN(v));
  const dataMin = Math.min(...dataValues);
  const dataMax = Math.max(...dataValues);
  let step =
    tolerance <= 0.1
      ? 0.02
      : tolerance <= 0.3
        ? 0.05
        : tolerance <= 1
          ? 0.1
          : tolerance <= 3
            ? 0.5
            : tolerance <= 10
              ? 1
              : tolerance <= 30
                ? 5
                : 10;
  let halfSteps = Math.ceil(Math.max(tolerance, target - dataMin, dataMax - target) / step) + 1;
  while (halfSteps * 2 + 1 > 7) {
    step *= 2;
    halfSteps = Math.ceil(Math.max(tolerance, target - dataMin, dataMax - target) / step) + 1;
  }
  const yMin = parseFloat((target - halfSteps * step).toFixed(2));
  const yMax = parseFloat((target + halfSteps * step).toFixed(2));
  const tickCount = halfSteps * 2 + 1;
  const yTicks = Array.from({ length: tickCount }, (_, i) => parseFloat((yMin + i * step).toFixed(2)));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Xbar',
        data: valid.map(d => d.xbar),
        borderColor: '#993300',
        backgroundColor: '#993300',
        borderWidth: 1,
        pointStyle: 'rectRot',
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

  const makeOptions = (fontSize: number) => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 20, right: 20 } },
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, pointStyle: 'line' } },
      title: {
        display: true,
        text: 'Xbar Chart _ Cathode Press',
        font: { size: fontSize },
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
        },
        afterBuildTicks: (axis: { ticks: { value: number }[] }) => {
          axis.ticks = yTicks.map(v => ({ value: v }));
        },
        title: { display: true, text: '두께 (μm)' },
      },
    },
  });

  return (
    <>
      <div className={styles.tableSection}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <button
            onClick={() => setExpanded(true)}
            style={{
              padding: '4px 12px',
              fontSize: 12,
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              background: '#f1f5f9',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            ⛶ 확대
          </button>
        </div>
        <div style={{ height: 270 }}>
          <Line data={chartData} options={makeOptions(14) as Parameters<typeof Line>[0]['options']} />
        </div>
      </div>

      {expanded && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setExpanded(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              width: '85vw',
              maxWidth: 1100,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Xbar Chart _ Cathode Press</span>
              <button
                onClick={() => setExpanded(false)}
                style={{
                  padding: '4px 12px',
                  fontSize: 13,
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  background: '#f1f5f9',
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                ✕ 닫기
              </button>
            </div>
            <div style={{ height: '60vh' }}>
              <Line data={chartData} options={makeOptions(16) as Parameters<typeof Line>[0]['options']} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
