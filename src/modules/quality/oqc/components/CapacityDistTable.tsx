import styles from '../../../../styles/quality/oqc/OQCTable.module.css';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CapacityDistTableProps {
  capacities: number[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BINS = [
  35.0, 35.2, 35.4, 35.6, 35.9, 36.0, 36.2, 36.4, 36.6, 36.8,
  37.0, 37.2, 37.4, 37.6, 37.8, 38.0, 38.2, 38.4, 38.6, 38.8,
  39.0, 39.2, 39.4, 39.6, 39.8, 40.0, 40.2, 40.4, 40.6, 40.8,
  41.0, 41.2, 41.4, 41.6, 41.8, 42.0, 42.2, 42.4, 42.6, 42.8,
  43.0,
];

const BIN_WIDTH = 0.2;

// ── Helpers ───────────────────────────────────────────────────────────────────

function normPdf(x: number, mean: number, stddev: number): number {
  const coeff = 1 / (stddev * Math.sqrt(2 * Math.PI));
  const exp = -0.5 * ((x - mean) / stddev) ** 2;
  return coeff * Math.exp(exp);
}

function stdevP(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CapacityDistTable({ capacities }: CapacityDistTableProps) {
  const mean = capacities.length
    ? capacities.reduce((a, b) => a + b, 0) / capacities.length
    : 0;
  const stddev = stdevP(capacities);

  // 빈도수: bin[i] 초과 ~ bin[i+1] 이하 (FREQUENCY 방식)
  // bin[0]은 -Infinity 초과 ~ bin[0] 이하
  const frequencies = BINS.map((bin, i) => {
    const lower = i === 0 ? -Infinity : BINS[i - 1];
    return capacities.filter(v => v > lower && v <= bin).length;
  });

  // 기타: 어떤 bin에도 속하지 않는 값 (마지막 bin 초과)
  const otherCount = capacities.filter(v => v > BINS[BINS.length - 1]).length;

  // 확률밀도: NORM.DIST(bin, mean, stddev, false) × binWidth
  const densities = BINS.map(bin => normPdf(bin, mean, stddev) * BIN_WIDTH);

  const thStyle: React.CSSProperties = {
    background: '#215C98',
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.lqcTable} style={{ minWidth: 360 }}>
          <thead>
            <tr>
              <th colSpan={3} style={thStyle}>
                Standard Capacity 정규분포
              </th>
            </tr>
            <tr>
              <th style={thStyle}>계급</th>
              <th style={thStyle}>빈도수</th>
              <th style={thStyle}>확률밀도</th>
            </tr>
          </thead>
          <tbody>
            {BINS.map((bin, i) => (
              <tr key={bin}>
                <td style={{ textAlign: 'center' }}>{bin.toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{frequencies[i]}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.8em' }}>
                  {densities[i].toPrecision(15)}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ textAlign: 'center' }}>기타</td>
              <td style={{ textAlign: 'center' }}>{otherCount}</td>
              <td style={{ textAlign: 'right' }}>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
