import styles from '../../../../styles/quality/oqc/OQCTable.module.css';

// ── Types ──────────────────────────────────────────────────────────────────────

interface NormDistTableProps {
  title: string;
  bins: number[];
  binWidth: number;
  values: number[];
  binDecimals?: number;
}

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

export default function NormDistTable({ title, bins, binWidth, values, binDecimals = 2 }: NormDistTableProps) {
  const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const stddev = stdevP(values);

  const frequencies = bins.map((bin, i) => {
    const lower = i === 0 ? -Infinity : bins[i - 1];
    return values.filter(v => v > lower && v <= bin).length;
  });

  const otherCount = values.filter(v => v > bins[bins.length - 1]).length;

  const densities = bins.map(bin => normPdf(bin, mean, stddev) * binWidth);

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
              <th colSpan={3} style={thStyle}>{title}</th>
            </tr>
            <tr>
              <th style={thStyle}>계급</th>
              <th style={thStyle}>빈도수</th>
              <th style={thStyle}>확률밀도</th>
            </tr>
          </thead>
          <tbody>
            {bins.map((bin, i) => (
              <tr key={bin}>
                <td style={{ textAlign: 'center' }}>{bin.toFixed(binDecimals)}</td>
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
