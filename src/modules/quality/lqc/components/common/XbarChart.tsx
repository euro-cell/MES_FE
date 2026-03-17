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
import type { MeasurementRow } from '../coating/CoatingMeasurementTable';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface XbarChartProps {
  data: MeasurementRow[];
}

export default function XbarChart({ data }: XbarChartProps) {
  const [expanded, setExpanded] = useState(false);

  const valid = data.filter(row => row.measurements.some((v: number | null) => v !== null));

  if (valid.length === 0) return null;

  const labels = valid.map(row => String(row.rowIndex));

  const allValues = valid.flatMap(d => [d.xbar, d.xbar_cl, d.xbar_ucl, d.xbar_lcl, d.usl, d.lsl]).filter((v): v is number => v !== null && !isNaN(v));
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const lsl = valid[0]?.lsl ?? 24.13;
  const usl = valid[0]?.usl ?? 25.13;
  const range = Math.max(usl - lsl, dataMax - dataMin, 0.5);
  const margin = range * 0.1;
  const yMin = parseFloat((Math.min(lsl, dataMin) - margin).toFixed(2));
  const yMax = parseFloat((Math.max(usl, dataMax) + margin).toFixed(2));
  const step = 0.25;
  const tickCount = Math.round((yMax - yMin) / step) + 1;
  const yTicks = Array.from({ length: tickCount }, (_, i) =>
    parseFloat((yMin + i * step).toFixed(2))
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
        text: 'Xbar Chart _ Cathode Coating',
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
        title: { display: true, text: 'Loading (mg/㎠)' },
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

      {/* 확대 모달 */}
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
              <span style={{ fontWeight: 600, fontSize: 15 }}>Xbar Chart _ Cathode Coating</span>
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
