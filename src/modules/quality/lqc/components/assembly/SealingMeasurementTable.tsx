import { useState, useEffect } from 'react';
import { getLQCSealingData, type SealingData } from '../../../../../api/quality/LQCService';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';

export interface SealingMeasurementRow {
  rowIndex: number;
  measurements: (number | null)[];
  usl: number;
  lsl: number;
  xbar: number;
  r: number;
  xbar_cl: number;
  xbar_ucl: number;
  xbar_lcl: number;
  r_cl: number;
  r_ucl: number;
  r_lcl: number;
}

interface SealingMeasurementTableProps {
  projectId: number;
  sideUsl?: number | null;
  sideLsl?: number | null;
  topUsl?: number | null;
  topLsl?: number | null;
  onNChange?: (n: number) => void;
  onDataChange?: (rows: SealingMeasurementRow[]) => void;
  onTopDataChange?: (rows: SealingMeasurementRow[]) => void;
}

const CONTROL_CHART_CONSTANTS: Record<number, { A2: number; D4: number; D3: number }> = {
  2: { A2: 1.88, D4: 3.267, D3: 0 },
  3: { A2: 1.023, D4: 2.575, D3: 0 },
  4: { A2: 0.729, D4: 2.282, D3: 0 },
  5: { A2: 0.577, D4: 2.115, D3: 0 },
  6: { A2: 0.483, D4: 2.004, D3: 0 },
  7: { A2: 0.419, D4: 1.924, D3: 0.076 },
  8: { A2: 0.373, D4: 1.864, D3: 0.136 },
};

const GROUP_SIZE = 8;

const fmt = (value: number | null | undefined, decimals: number): string => {
  if (value === null || value === undefined || isNaN(value as number)) return '';
  return (value as number).toFixed(decimals);
};

function toMeasurementRows(
  data: SealingData[],
  usl: number,
  lsl: number,
  type: 'side' | 'top',
): SealingMeasurementRow[] {
  const validData = data.filter(d => {
    const arr = type === 'side' ? d.sideSealing : d.topSealing;
    return arr && arr.some(v => v !== null && v !== undefined);
  });

  if (validData.length === 0) return [];

  const rowBases = validData.map(d => {
    const arr = type === 'side' ? d.sideSealing : d.topSealing;
    const raw: (number | null)[] = Array.from({ length: 8 }, (_, i) => arr[i] ?? null);
    const valid = raw.filter((v): v is number => v !== null);
    if (valid.length === 0) return { raw, valid, xbar: 0, r: 0 };
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
  const r_lcl = c.D3 * rAvg;

  return rowBases.map((b, i) => ({
    rowIndex: i + 1,
    measurements: b.raw,
    usl,
    lsl,
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

const outOfControlStyle: React.CSSProperties = { backgroundColor: '#ef4444', color: '#fff' };

interface SpcTableProps {
  title: string;
  inspectionItem: string;
  rows: SealingMeasurementRow[];
  groupSize: number;
}

function SpcTable({ title, inspectionItem, rows, groupSize }: SpcTableProps) {
  return (
    <div className={styles.tableSection}>
      {/* 메타 정보 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px', marginBottom: '8px' }}>
        <h3 className={styles.tableTitle}>{title}</h3>
        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          검사항목: <strong>{inspectionItem}</strong>
        </span>
        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          군의 크기: <strong>{groupSize}</strong>
        </span>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.lqcTable}>
          <thead>
            <tr>
              <th rowSpan={2}>군번호</th>
              {Array.from({ length: GROUP_SIZE }, (_, i) => (
                <th key={i} rowSpan={2} className={i === 0 ? styles.groupBorder : undefined}>
                  X{i + 1}
                </th>
              ))}
              <th rowSpan={2} className={styles.groupBorder}>USL</th>
              <th rowSpan={2}>LSL</th>
              <th rowSpan={2} className={styles.groupBorder}>Xbar</th>
              <th rowSpan={2}>R</th>
              <th colSpan={3} className={styles.groupBorder}>Xbar 관리도</th>
              <th colSpan={3} className={styles.groupBorder}>R 관리도</th>
            </tr>
            <tr>
              <th className={styles.groupBorder}>CL</th>
              <th>UCL</th>
              <th>LCL</th>
              <th className={styles.groupBorder}>CL</th>
              <th>UCL</th>
              <th>LCL</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map(row => {
                const xbarOoc = row.xbar > row.xbar_ucl || row.xbar < row.xbar_lcl;
                const rOoc = row.r > row.r_ucl;
                return (
                  <tr key={row.rowIndex}>
                    <td>{row.rowIndex}</td>
                    {row.measurements.map((v, i) => (
                      <td key={i} className={i === 0 ? styles.groupBorder : undefined}>
                        {v !== null ? fmt(v, 0) : ''}
                      </td>
                    ))}
                    <td className={styles.groupBorder}>{fmt(row.usl, 0)}</td>
                    <td>{fmt(row.lsl, 0)}</td>
                    <td className={styles.groupBorder} style={xbarOoc ? outOfControlStyle : undefined}>
                      {fmt(row.xbar, 2)}
                    </td>
                    <td style={rOoc ? outOfControlStyle : undefined}>{fmt(row.r, 2)}</td>
                    <td className={styles.groupBorder}>{fmt(row.xbar_cl, 2)}</td>
                    <td>{fmt(row.xbar_ucl, 2)}</td>
                    <td>{fmt(row.xbar_lcl, 2)}</td>
                    <td className={styles.groupBorder}>{fmt(row.r_cl, 2)}</td>
                    <td>{fmt(row.r_ucl, 2)}</td>
                    <td>{fmt(row.r_lcl, 2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={1 + GROUP_SIZE + 2 + 4 + 4} className={styles.noDataRow}>
                  데이터 없음
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SealingMeasurementTable({
  projectId,
  sideUsl,
  sideLsl,
  topUsl,
  topLsl,
  onNChange,
  onDataChange,
  onTopDataChange,
}: SealingMeasurementTableProps) {
  const [sideRows, setSideRows] = useState<SealingMeasurementRow[]>([]);
  const [topRows, setTopRows] = useState<SealingMeasurementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getLQCSealingData(projectId);
        const side = toMeasurementRows(data, sideUsl ?? 290, sideLsl ?? 250, 'side');
        const top = toMeasurementRows(data, topUsl ?? 780, topLsl ?? 720, 'top');
        setSideRows(side);
        setTopRows(top);
        onDataChange?.(side);
        onTopDataChange?.(top);
        if (side.length > 0) onNChange?.(GROUP_SIZE);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, sideUsl, sideLsl, topUsl, topLsl]);

  if (loading) return <div style={{ padding: 16 }}>로딩 중...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>오류: {error}</div>;

  return (
    <>
      <SpcTable
        title='Side Sealing 검사(파우치부)'
        inspectionItem='두께'
        rows={sideRows}
        groupSize={sideRows.length > 0 ? sideRows[0].measurements.filter(v => v !== null).length : 0}
      />
      <SpcTable
        title='Top(Tab) Sealing 검사'
        inspectionItem='두께'
        rows={topRows}
        groupSize={topRows.length > 0 ? topRows[0].measurements.filter(v => v !== null).length : 0}
      />
    </>
  );
}
