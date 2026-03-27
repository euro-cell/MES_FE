import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import styles from '../../../../styles/quality/oqc/OQCTable.module.css';
import SpecEditModal from '../../lqc/components/common/SpecEditModal';
import { getOQCSpec, saveOQCSpec } from '../../../../api/quality/OQCService';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// ── Types ─────────────────────────────────────────────────────────────────────

interface DimensionInspectionRow {
  no: number;
  manufacturedDate: string;
  lotNo: string;
  widthTop: number | null;
  widthMiddle: number | null;
  widthBottom: number | null;
  widthAvg: number | null;
  lengthBottom: number | null;
  thicknessMiddle: number | null;
}

interface SpecValue {
  min?: number;
  max?: number;
  target?: number;
  tolerance?: number;
  unit: string;
}

// ── Spec Fields ───────────────────────────────────────────────────────────────

const SPEC_FIELDS = [
  { key: 'width',     label: '폭',   type: 'target-tolerance' as const, unit: 'mm' },
  { key: 'length',    label: '길이', type: 'target-tolerance' as const, unit: 'mm' },
  { key: 'thickness', label: '두께', type: 'target-tolerance' as const, unit: 'mm' },
];

const DEFAULT_SPECS: Record<string, SpecValue> = {};

// ── Sample Data ───────────────────────────────────────────────────────────────

const INITIAL_ROWS: DimensionInspectionRow[] = [
  { no: 1,  manufacturedDate: '2025-06-13', lotNo: 'O1DF130001', widthTop: 195,   widthMiddle: 195,   widthBottom: 196,   widthAvg: 195.33, lengthBottom: 215, thicknessMiddle: 10.90 },
  { no: 2,  manufacturedDate: '2025-06-23', lotNo: 'O1DF230043', widthTop: 195.5, widthMiddle: 194.5, widthBottom: 196,   widthAvg: 195.33, lengthBottom: 215, thicknessMiddle: 11.03 },
  { no: 3,  manufacturedDate: '2025-07-15', lotNo: 'O1DG150053', widthTop: 195,   widthMiddle: 194,   widthBottom: 195,   widthAvg: 194.67, lengthBottom: 215, thicknessMiddle: 11.01 },
  { no: 4,  manufacturedDate: '2025-07-17', lotNo: 'O1DG170062', widthTop: 195,   widthMiddle: 195,   widthBottom: 195,   widthAvg: 195.00, lengthBottom: 215, thicknessMiddle: 11.03 },
  { no: 5,  manufacturedDate: '2025-07-18', lotNo: 'O1DG180072', widthTop: 195,   widthMiddle: 194,   widthBottom: 195,   widthAvg: 194.67, lengthBottom: 215, thicknessMiddle: 11.05 },
  { no: 6,  manufacturedDate: '2025-07-21', lotNo: 'O1DG210081', widthTop: 195,   widthMiddle: 195,   widthBottom: 196,   widthAvg: 195.33, lengthBottom: 215, thicknessMiddle: 11.16 },
  { no: 7,  manufacturedDate: '2025-07-22', lotNo: 'O1DG220091', widthTop: 196,   widthMiddle: 195,   widthBottom: 196,   widthAvg: 195.67, lengthBottom: 215, thicknessMiddle: 11.10 },
  { no: 8,  manufacturedDate: '2025-07-23', lotNo: 'O1DG230101', widthTop: 195,   widthMiddle: 194,   widthBottom: 195,   widthAvg: 194.67, lengthBottom: 214, thicknessMiddle: 11.07 },
  { no: 9,  manufacturedDate: '2025-07-24', lotNo: 'O1DG240111', widthTop: 195,   widthMiddle: 195,   widthBottom: 196,   widthAvg: 195.33, lengthBottom: 215, thicknessMiddle: 11.00 },
  { no: 10, manufacturedDate: '2025-07-25', lotNo: 'O1DG250121', widthTop: 194,   widthMiddle: 194,   widthBottom: 194,   widthAvg: 194.00, lengthBottom: 215, thicknessMiddle: 10.95 },
  { no: 11, manufacturedDate: '2025-08-06', lotNo: 'O1DH060131', widthTop: 195,   widthMiddle: 196,   widthBottom: 195,   widthAvg: 195.33, lengthBottom: 214, thicknessMiddle: 10.97 },
  { no: 12, manufacturedDate: '2025-08-07', lotNo: 'O1DH070141', widthTop: 196,   widthMiddle: 195,   widthBottom: 195,   widthAvg: 195.33, lengthBottom: 215, thicknessMiddle: 11.05 },
  { no: 13, manufacturedDate: '2025-08-07', lotNo: 'O1DH070151', widthTop: 195,   widthMiddle: 194,   widthBottom: 196,   widthAvg: 195.00, lengthBottom: 215, thicknessMiddle: 11.10 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function stdevP(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length);
}

function calcStats(rows: DimensionInspectionRow[]) {
  const pick = (key: keyof DimensionInspectionRow) =>
    rows.map((r) => r[key] as number | null).filter((v): v is number => v !== null);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const max = (arr: number[]) => arr.length ? Math.max(...arr) : null;
  const min = (arr: number[]) => arr.length ? Math.min(...arr) : null;

  const keys = ['widthTop', 'widthMiddle', 'widthBottom', 'widthAvg', 'lengthBottom', 'thicknessMiddle'] as const;
  const result: Record<string, { avg: number | null; max: number | null; min: number | null; stdev: number }> = {};
  for (const k of keys) {
    const arr = pick(k);
    result[k] = { avg: avg(arr), max: max(arr), min: min(arr), stdev: stdevP(arr) };
  }
  return result;
}

function isOutOfSpec(value: number | null, spec: SpecValue | undefined): boolean {
  if (value === null || !spec) return false;
  if (spec.min !== undefined && value < spec.min) return true;
  if (spec.max !== undefined && value > spec.max) return true;
  return false;
}

function specFromTargetTol(s: SpecValue | undefined): SpecValue | undefined {
  if (!s || s.target === undefined || s.tolerance === undefined) return s;
  return { ...s, min: s.target - s.tolerance, max: s.target + s.tolerance };
}

function specLabel(s: SpecValue | undefined): string {
  if (!s || s.target === undefined) return '미설정';
  if (s.tolerance !== undefined) return `${s.target}±${s.tolerance}`;
  return `${s.target}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface DimensionTableProps {
  projectId: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DimensionTable({ projectId }: DimensionTableProps) {
  const [specs, setSpecs] = useState<Record<string, SpecValue>>(DEFAULT_SPECS);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const data = await getOQCSpec(projectId, 'DIMENSION');
        if (data.length > 0) setSpecs(data[0].specs);
      } catch {
        // fallback to defaults
      }
    };
    loadSpecs();
  }, [projectId]);

  const rows = INITIAL_ROWS;
  const stats = calcStats(rows);

  const widthSpec  = specFromTargetTol(specs['width']);
  const lengthSpec = specFromTargetTol(specs['length']);
  const thickSpec  = specFromTargetTol(specs['thickness']);

  const fmtInt   = (v: number | null) => v === null ? '-' : Math.round(v).toString();
  const fmtDec2  = (v: number | null) => v === null ? '-' : v.toFixed(2);
  const fmtDec3  = (v: number | null) => v === null ? '-' : v.toFixed(3);

  const remarkLines = [
    '생산일수 기준 1일당 샘플군 1개씩 측정하여 표기',
  ];
  const samplingPolicy = '※ 샘플링 수량: 10개 이하는 전수, 10개 초과는 전체 수량의 10분할 기준으로 최소 10개, 800개 초과는 1일당 1개';

  return (
    <>
      <div className={styles.container}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>● 치수 검사</h3>
          <button className={styles.specButton} onClick={() => setIsSpecModalOpen(true)}>
            규격 설정
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.lqcTable}>
            <thead>
              {/* Row 2: 대분류 헤더 */}
              <tr>
                <th rowSpan={2} >No.</th>
                <th rowSpan={2} >제조일자</th>
                <th rowSpan={2} >Lot no.</th>
                <th colSpan={4} >폭(mm)</th>
                <th rowSpan={2} >길이(mm)</th>
                <th rowSpan={2} >두께(mm)</th>
              </tr>
              {/* Row 3: 폭 소분류 */}
              <tr>
                <th >상부</th>
                <th >중부</th>
                <th >하부</th>
                <th >평균</th>
              </tr>
              {/* 규격 행 */}
              <tr className={styles.specRow} style={{ fontWeight: 500 }}>
                <td colSpan={3}>규격</td>
                <td colSpan={4}>{specLabel(specs['width'])}</td>
                <td>{specLabel(specs['length'])}</td>
                <td>{specLabel(specs['thickness'])}</td>
              </tr>
              {/* 통계 행 */}
              <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                <td colSpan={3}>Ave.</td>
                <td>{fmtInt(stats.widthTop.avg)}</td>
                <td>{fmtInt(stats.widthMiddle.avg)}</td>
                <td>{fmtInt(stats.widthBottom.avg)}</td>
                <td>{fmtInt(stats.widthAvg.avg)}</td>
                <td>{fmtInt(stats.lengthBottom.avg)}</td>
                <td>{fmtDec2(stats.thicknessMiddle.avg)}</td>
              </tr>
              <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                <td colSpan={3}>Max.</td>
                <td>{fmtInt(stats.widthTop.max)}</td>
                <td>{fmtInt(stats.widthMiddle.max)}</td>
                <td>{fmtInt(stats.widthBottom.max)}</td>
                <td>{fmtInt(stats.widthAvg.max)}</td>
                <td>{fmtInt(stats.lengthBottom.max)}</td>
                <td>{fmtDec2(stats.thicknessMiddle.max)}</td>
              </tr>
              <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                <td colSpan={3}>Min.</td>
                <td>{fmtInt(stats.widthTop.min)}</td>
                <td>{fmtInt(stats.widthMiddle.min)}</td>
                <td>{fmtInt(stats.widthBottom.min)}</td>
                <td>{fmtInt(stats.widthAvg.min)}</td>
                <td>{fmtInt(stats.lengthBottom.min)}</td>
                <td>{fmtDec2(stats.thicknessMiddle.min)}</td>
              </tr>
              <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                <td colSpan={3}>Stdev.</td>
                <td>{fmtDec3(stats.widthTop.stdev)}</td>
                <td>{fmtDec3(stats.widthMiddle.stdev)}</td>
                <td>{fmtDec3(stats.widthBottom.stdev)}</td>
                <td>{fmtDec3(stats.widthAvg.stdev)}</td>
                <td>{fmtDec3(stats.lengthBottom.stdev)}</td>
                <td>{fmtDec3(stats.thicknessMiddle.stdev)}</td>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.no}>
                  <td>{row.no}</td>
                  <td>{row.manufacturedDate}</td>
                  <td className={styles.lotCell}>{row.lotNo}</td>
                  <td className={isOutOfSpec(row.widthTop, widthSpec) ? styles.outOfSpec : ''}>
                    {fmtInt(row.widthTop)}
                  </td>
                  <td className={isOutOfSpec(row.widthMiddle, widthSpec) ? styles.outOfSpec : ''}>
                    {fmtInt(row.widthMiddle)}
                  </td>
                  <td className={isOutOfSpec(row.widthBottom, widthSpec) ? styles.outOfSpec : ''}>
                    {fmtInt(row.widthBottom)}
                  </td>
                  <td className={isOutOfSpec(row.widthAvg, widthSpec) ? styles.outOfSpec : ''}>
                    {fmtInt(row.widthAvg)}
                  </td>
                  <td className={isOutOfSpec(row.lengthBottom, lengthSpec) ? styles.outOfSpec : ''}>
                    {fmtInt(row.lengthBottom)}
                  </td>
                  <td className={isOutOfSpec(row.thicknessMiddle, thickSpec) ? styles.outOfSpec : ''}>
                    {fmtDec2(row.thicknessMiddle)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 차트 */}
        <div style={{ height: 340 }}>
          <Chart
            type="bar"
            data={{
              labels: rows.map(r => r.manufacturedDate),
              datasets: [
                {
                  type: 'bar' as const,
                  label: '두께(mm)',
                  data: rows.map(r => r.thicknessMiddle),
                  backgroundColor: 'rgba(37, 99, 235, 0.6)',
                  borderColor: '#2563eb',
                  borderWidth: 1,
                  yAxisID: 'yLeft',
                },
                {
                  type: 'line' as const,
                  label: '폭 평균(mm)',
                  data: rows.map(r => r.widthAvg),
                  borderColor: '#ca8a04',
                  backgroundColor: '#ca8a04',
                  borderWidth: 2,
                  pointRadius: 3,
                  yAxisID: 'yRight',
                },
                {
                  type: 'line' as const,
                  label: '길이(mm)',
                  data: rows.map(r => r.lengthBottom),
                  borderColor: '#16a34a',
                  backgroundColor: '#16a34a',
                  borderWidth: 2,
                  pointRadius: 3,
                  yAxisID: 'yRight',
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: { display: true, text: '제품 치수 검사 결과', font: { size: 13 } },
                legend: { display: true },
                tooltip: { mode: 'index', intersect: false },
              },
              scales: {
                x: { ticks: { font: { size: 11 } } },
                yLeft: {
                  type: 'linear',
                  position: 'left',
                  min: 10.3,
                  max: 11.3,
                  ticks: { stepSize: 0.5 },
                  title: { display: true, text: '두께(mm)' },
                },
                yRight: {
                  type: 'linear',
                  position: 'right',
                  min: 190,
                  max: 220,
                  ticks: { stepSize: 5 },
                  title: { display: true, text: '폭/길이(mm)' },
                  grid: { drawOnChartArea: false },
                },
              },
            }}
          />
        </div>

        {/* Remark 블록 */}
        <div className={styles.remarkBlock}>
          <div className={styles.remarkHeader}>■ Remark</div>
          {remarkLines.map((line, i) => (
            <div key={i} className={styles.remarkLine}>{' -. '}{line}</div>
          ))}
        </div>

        {/* 샘플링 정책 */}
        <div className={styles.samplingPolicy}>{samplingPolicy}</div>
      </div>

      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={async (newSpecs) => {
          try {
            await saveOQCSpec(projectId, 'DIMENSION', 'DIMENSION', newSpecs);
            setSpecs(newSpecs);
          } catch (err) {
            console.error('Failed to save spec:', err);
          }
        }}
        title="치수 검사"
        specs={specs}
        specFields={SPEC_FIELDS}
      />
    </>
  );
}
