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
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PressRChartProps {
  data: PressMeasurementRow[];
}

export default function PressRChart({ data }: PressRChartProps) {
  const [expanded, setExpanded] = useState(false);

  const valid = data.filter(row => row.measurements.some(v => v !== null));
  if (valid.length === 0) return null;

  const labels = valid.map(row => String(row.rowIndex));

  const yMin = 0;
  const yMax = 1.4;
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'R',
        data: valid.map(d => d.r),
        borderColor: '#993300',
        backgroundColor: '#993300',
        borderWidth: 1,
        pointStyle: 'rectRot' as const,
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
        pointStyle: 'rect' as const,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0,
      },
    ],
  };

  const makeOptions = (fontSize: number) => ({
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
        afterBuildTicks: (axis: { ticks: { value: number }[] }) => {
          axis.ticks = yTicks.map(v => ({ value: v }));
        },
        ticks: {
          callback: (value: number | string) => Number(value).toFixed(1),
        },
        title: { display: true, text: 'R' },
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
              <span style={{ fontWeight: 600, fontSize: 15 }}>R Chart</span>
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
