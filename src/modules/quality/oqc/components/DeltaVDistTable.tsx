import styles from '../../../../styles/quality/oqc/OQCTable.module.css';

// ── Types ──────────────────────────────────────────────────────────────────────

interface DeltaVDistTableProps {
  deltaVValues: number[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BINS = [
  0.0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4, 2.7,
  3.0, 3.3, 3.6, 3.9, 4.2, 4.5, 4.8, 5.1, 5.4, 5.7,
  6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5,
  11.0, 11.5, 12.0, 12.5, 13.0, 13.5, 14.0, 15.0, 16.0, 17.0, 18.0,
];

const DENSITY_BIN_WIDTH = 0.3;

// ── Helpers ───────────────────────────────────────────────────────────────────

function normPdf(x: number, mean: number, stddev: number): number {
  const coeff = 1 / (stddev * Math.sqrt(2 * Math.PI));
  return coeff * Math.exp(-0.5 * ((x - mean) / stddev) ** 2);
}

function stdevP(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DeltaVDistTable({ deltaVValues }: DeltaVDistTableProps) {
  const mean = deltaVValues.length
    ? deltaVValues.reduce((a, b) => a + b, 0) / deltaVValues.length
    : 0;
  const stddev = stdevP(deltaVValues);

  // bin[0]: -Infinity 초과 ~ bin[0] 이하
  // bin[i]: bin[i-1] 초과 ~ bin[i] 이하
  const frequencies = BINS.map((bin, i) => {
    const lower = i === 0 ? -Infinity : BINS[i - 1];
    return deltaVValues.filter(v => v > lower && v <= bin).length;
  });

  const otherCount = deltaVValues.filter(v => v > BINS[BINS.length - 1]).length;

  // density: binWidth 고정 0.3 적용
  const densities = BINS.map(bin => normPdf(bin, mean, stddev) * DENSITY_BIN_WIDTH);

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
              <th colSpan={3} style={thStyle}>출하 OCV4 △V 정규분포</th>
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
                <td style={{ textAlign: 'center' }}>{bin.toFixed(1)}</td>
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
