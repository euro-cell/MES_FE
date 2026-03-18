import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';
import SpecEditModal from '../common/SpecEditModal';
import {
  getLQCSpecs,
  saveLQCSpec,
  getLQCFinalSealingData,
  type SpecValue,
} from '../../../../../api/quality/LQCService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MAX_COLS = 10;

interface FinalSealingRow {
  id: number;
  workDate: string;
  lot: string;
  thicknesses: (number | null)[];
}

interface FinalSealingTableProps {
  projectId: number;
}

const FINAL_SEALING_SPEC_FIELDS = [
  { key: 'thickness', label: 'Final Sealing 두께', type: 'target-tolerance' as const, unit: '㎛' },
];

const formatSpec = (spec: SpecValue | undefined, type: string): string => {
  if (!spec) return '미설정';
  if (type === 'target-tolerance') {
    if (spec.target !== undefined && spec.tolerance !== undefined) {
      return `${spec.target.toLocaleString()} ± ${spec.tolerance.toLocaleString()}`;
    }
  }
  return '미설정';
};

const formatNumber = (value: number | null, decimals: number = 0): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return value.toFixed(decimals);
};

const toNumber = (v: number | null | undefined): number | null => {
  if (v === null || v === undefined) return null;
  return isNaN(v) ? null : v;
};

const calcAvg = (values: (number | null)[]): number | null => {
  const valid = values.map(toNumber).filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
};

const calcMax = (values: (number | null)[]): number | null => {
  const valid = values.map(toNumber).filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return Math.max(...valid);
};

const calcMin = (values: (number | null)[]): number | null => {
  const valid = values.map(toNumber).filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return Math.min(...valid);
};

const calcStdev = (values: (number | null)[]): number | null => {
  const valid = values.map(toNumber).filter((v): v is number => v !== null);
  if (valid.length < 2) return null;
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  return Math.sqrt(valid.map(v => Math.pow(v - avg, 2)).reduce((a, b) => a + b, 0) / valid.length);
};

export default function FinalSealingTable({ projectId }: FinalSealingTableProps) {
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [specs, setSpecs] = useState<Record<string, SpecValue>>({});
  const [data, setData] = useState<FinalSealingRow[]>([]);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specsData = await getLQCSpecs(projectId, 'ASSEMBLY_FINAL_SEALING', 'FINAL_SEALING');
        const spec = specsData.find(s => s.itemType === 'FINAL_SEALING');
        if (spec) setSpecs(spec.specs);
      } catch (error) {
        console.error('Failed to load specs:', error);
      }
    };
    loadSpecs();
  }, [projectId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiData = await getLQCFinalSealingData(projectId);
        const mapped: FinalSealingRow[] = apiData.map(item => ({
          id: item.id,
          workDate: item.workDate,
          lot: item.lot,
          thicknesses: Array.from({ length: MAX_COLS }, (_, i) => item.thicknesses[i] ?? null),
        }));
        setData(mapped);
      } catch (error) {
        console.error('Failed to load final sealing data:', error);
      }
    };
    loadData();
  }, [projectId]);

  const handleSaveSpec = async (newSpecs: Record<string, SpecValue>) => {
    try {
      await saveLQCSpec(projectId, 'ASSEMBLY_FINAL_SEALING', 'FINAL_SEALING', newSpecs);
      setSpecs(newSpecs);
      setIsSpecModalOpen(false);
    } catch (error) {
      console.error('Failed to save spec:', error);
    }
  };

  const hasData = data.length > 0;
  const rowAvgs = data.map(row => calcAvg(row.thicknesses));

  // 열별 통계 (c0~c9)
  const colStats = Array.from({ length: MAX_COLS }, (_, i) => ({
    avg: calcAvg(data.map(d => d.thicknesses[i] ?? null)),
    max: calcMax(data.map(d => d.thicknesses[i] ?? null)),
    min: calcMin(data.map(d => d.thicknesses[i] ?? null)),
    stdev: calcStdev(data.map(d => d.thicknesses[i] ?? null)),
  }));

  const totalColSpan = 3 + 1 + MAX_COLS; // No. + 작업일자 + Lot + 평균 + 1~10

  // 차트 데이터
  const chartLabels = data.map(d => d.workDate);
  const chartAvgValues = rowAvgs.map(v => v ?? 0);

  const getChartRange = () => {
    const spec = specs.thickness;
    if (spec?.target !== undefined && spec?.tolerance !== undefined) {
      return { min: spec.target - spec.tolerance, max: spec.target + spec.tolerance };
    }
    const valid = rowAvgs.filter((v): v is number => v !== null);
    if (valid.length > 0) {
      const dataMin = Math.min(...valid);
      const dataMax = Math.max(...valid);
      const padding = (dataMax - dataMin) * 0.2 || 5;
      return { min: Math.floor(dataMin - padding), max: Math.ceil(dataMax + padding) };
    }
    return { min: 250, max: 290 };
  };

  const chartRange = getChartRange();

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Final Sealing 두께',
      data: chartAvgValues,
      backgroundColor: '#f59e0b',
      borderColor: '#d97706',
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Final Sealing 결과' },
    },
    scales: {
      x: {
        min: chartRange.min,
        max: chartRange.max,
        title: { display: true, text: 'Thicnkess(㎛)' },
      },
    },
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>Final Sealing 검사</h3>
          <button className={styles.specButton} onClick={() => setIsSpecModalOpen(true)}>
            규격 설정
          </button>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table className={styles.lqcTable}>
            <thead>
              <tr>
                <th rowSpan={2}>No.</th>
                <th rowSpan={2}>작업일자</th>
                <th rowSpan={2}>Lot no.</th>
                <th colSpan={MAX_COLS + 1}>Final Sealing 두께 (㎛)</th>
              </tr>
              <tr>
                <th>평균</th>
                {Array.from({ length: MAX_COLS }, (_, i) => <th key={i}>{i + 1}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className={styles.specRow}>
                <td colSpan={3}>규격</td>
                <td colSpan={MAX_COLS + 1}>{formatSpec(specs.thickness, 'target-tolerance')}</td>
              </tr>
              <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                <td colSpan={3}>Ave.</td>
                <td>{formatNumber(calcAvg(rowAvgs), 0)}</td>
                {colStats.map((s, i) => <td key={i}>{formatNumber(s.avg, 0)}</td>)}
              </tr>
              <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                <td colSpan={3}>Max.</td>
                <td>{formatNumber(calcMax(rowAvgs), 0)}</td>
                {colStats.map((s, i) => <td key={i}>{formatNumber(s.max, 0)}</td>)}
              </tr>
              <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                <td colSpan={3}>Min.</td>
                <td>{formatNumber(calcMin(rowAvgs), 0)}</td>
                {colStats.map((s, i) => <td key={i}>{formatNumber(s.min, 0)}</td>)}
              </tr>
              <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                <td colSpan={3}>Stdev.</td>
                <td>{formatNumber(calcStdev(rowAvgs), 3)}</td>
                {colStats.map((s, i) => <td key={i}>{formatNumber(s.stdev, 3)}</td>)}
              </tr>
              {hasData ? (
                data.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{row.workDate}</td>
                    <td>{row.lot}</td>
                    <td>{formatNumber(rowAvgs[index], 0)}</td>
                    {row.thicknesses.map((v, i) => (
                      <td key={i}>{formatNumber(v, 0)}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={totalColSpan} className={styles.noDataRow}>데이터 없음</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {hasData && (
          <div style={{ flex: '0 0 340px', height: `${Math.max(200, data.length * 28 + 60)}px` }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
        </div>
      </div>

      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpec}
        title="Final Sealing 검사"
        specFields={FINAL_SEALING_SPEC_FIELDS}
        specs={specs}
      />
    </div>
  );
}
