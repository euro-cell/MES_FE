import { useState, useEffect } from 'react';
import { getLQCVDData, type VDData } from '../../../../api/quality/LQCService';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';

export interface VDMeasurementRow {
  rowIndex: number;
  measurements: (number | null)[];
  usl: number;
  lsl: null;
  xbar: number;
  r: number;
  xbar_cl: number;
  xbar_ucl: number;
  xbar_lcl: number;
  r_cl: number;
  r_ucl: number;
  r_lcl: number;
}

interface VDMeasurementTableProps {
  projectId: number;
  onNChange?: (n: number) => void;
  onDataChange?: (rows: VDMeasurementRow[]) => void;
}

const CONTROL_CHART_CONSTANTS: Record<number, { A2: number; D4: number; D3: number }> = {
  2: { A2: 1.880, D4: 3.267, D3: 0     },
  3: { A2: 1.023, D4: 2.575, D3: 0     },
  4: { A2: 0.729, D4: 2.282, D3: 0     },
  5: { A2: 0.577, D4: 2.115, D3: 0     },
  6: { A2: 0.483, D4: 2.004, D3: 0     },
  7: { A2: 0.419, D4: 1.924, D3: 0.076 },
  8: { A2: 0.373, D4: 1.864, D3: 0.136 },
};

const USL = 300;

const normalizeMeasurements = (raw: (number | null)[]): (number | null)[] => {
  const padded = [...raw];
  while (padded.length < 4) padded.push(null);
  return padded.slice(0, 4);
};

const calculateN = (rows: VDMeasurementRow[]): number => {
  const firstValid = rows.find(row => row.measurements.some(v => v !== null));
  if (!firstValid) return 0;
  return firstValid.measurements.filter(v => v !== null).length;
};

const fmt = (value: number | null | undefined, decimals: number): string => {
  if (value === null || value === undefined || isNaN(value as number)) return '';
  return (value as number).toFixed(decimals);
};

function toVDMeasurementRows(data: VDData[]): VDMeasurementRow[] {
  const validData = data.filter(d =>
    [d.moisture1, d.moisture2, d.moisture3].some(v => v !== null && v !== undefined)
  );

  if (validData.length === 0) return [];

  const rowBases = validData.map(d => {
    const raw: (number | null)[] = [d.moisture1, d.moisture2, d.moisture3];
    const valid = raw.filter((v): v is number => v !== null && v !== undefined);
    const xbar = valid.reduce((a, b) => a + b, 0) / valid.length;
    const r = Math.max(...valid) - Math.min(...valid);
    return { raw, valid, xbar, r };
  });

  const xbarAvg = rowBases.reduce((s, b) => s + b.xbar, 0) / rowBases.length;
  const rAvg = rowBases.reduce((s, b) => s + b.r, 0) / rowBases.length;
  const n = Math.max(...rowBases.map(b => b.valid.length));
  const c = CONTROL_CHART_CONSTANTS[Math.min(n, 8)] ?? CONTROL_CHART_CONSTANTS[8];

  const xbar_cl = xbarAvg;
  const xbar_ucl = xbarAvg + c.A2 * rAvg;
  const xbar_lcl = xbarAvg - c.A2 * rAvg;
  const r_cl = rAvg;
  const r_ucl = c.D4 * rAvg;
  const r_lcl = n > 6 ? c.D3 * rAvg : 0;

  return rowBases.map((b, i) => ({
    rowIndex: i + 1,
    measurements: normalizeMeasurements(b.raw),
    usl: USL,
    lsl: null,
    xbar: b.xbar,
    r: b.r,
    xbar_cl,
    xbar_ucl,
    xbar_lcl,
    r_cl,
    r_ucl,
    r_lcl,
  }));
}

export default function VDMeasurementTable({ projectId, onNChange, onDataChange }: VDMeasurementTableProps) {
  const [rows, setRows] = useState<VDMeasurementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getLQCVDData(projectId, 'C');
        const converted = toVDMeasurementRows(data);
        setRows(converted);
        onDataChange?.(converted);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  useEffect(() => {
    if (rows.length > 0) {
      onNChange?.(calculateN(rows));
    }
  }, [rows]);

  if (loading) return <div style={{ padding: 16 }}>로딩 중...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>오류: {error}</div>;

  return (
    <div className={styles.tableSection}>
      <h3 className={styles.tableTitle}>전극 수분함량 Xbar-R 관리도 (SPC)</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.lqcTable}>
          <thead>
            <tr>
              <th>군번호</th>
              {Array.from({ length: 4 }, (_, i) => (
                <th key={i} className={i === 0 ? styles.groupBorder : undefined}>X{i + 1}</th>
              ))}
              <th className={styles.groupBorder}>USL</th>
              <th>LSL</th>
              <th className={styles.groupBorder}>Xbar</th>
              <th>R</th>
              <th className={styles.groupBorder}>CL (Xbar)</th>
              <th>UCL (Xbar)</th>
              <th>LCL (Xbar)</th>
              <th className={styles.groupBorder}>CL (R)</th>
              <th>UCL (R)</th>
              <th>LCL (R)</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map(row => (
                <tr key={row.rowIndex}>
                  <td>{row.rowIndex}</td>
                  {Array.from({ length: 4 }, (_, i) => (
                    <td key={i} className={i === 0 ? styles.groupBorder : undefined}>
                      {fmt(row.measurements[i] ?? null, 2)}
                    </td>
                  ))}
                  <td className={styles.groupBorder}>{fmt(row.usl, 2)}</td>
                  <td>{''}</td>
                  <td className={styles.groupBorder}>{fmt(row.xbar, 4)}</td>
                  <td>{fmt(row.r, 4)}</td>
                  <td className={styles.groupBorder}>{fmt(row.xbar_cl, 4)}</td>
                  <td>{fmt(row.xbar_ucl, 4)}</td>
                  <td>{fmt(row.xbar_lcl, 4)}</td>
                  <td className={styles.groupBorder}>{fmt(row.r_cl, 4)}</td>
                  <td>{fmt(row.r_ucl, 4)}</td>
                  <td>{fmt(row.r_lcl, 4)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={16} className={styles.noDataRow}>데이터 없음</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
