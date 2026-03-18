import { useState, useEffect } from 'react';
import { getLQCFinalSealingData } from '../../../../../api/quality/LQCService';
import { SpcTable } from './SealingMeasurementTable';
import type { SealingMeasurementRow } from './SealingMeasurementTable';
import ControlChartConstantsTable from '../common/ControlChartConstantsTable';

const GROUP_SIZE = 8;

const CONTROL_CHART_CONSTANTS: Record<number, { A2: number; D4: number; D3: number }> = {
  2: { A2: 1.88, D4: 3.267, D3: 0 },
  3: { A2: 1.023, D4: 2.575, D3: 0 },
  4: { A2: 0.729, D4: 2.282, D3: 0 },
  5: { A2: 0.577, D4: 2.115, D3: 0 },
  6: { A2: 0.483, D4: 2.004, D3: 0 },
  7: { A2: 0.419, D4: 1.924, D3: 0.076 },
  8: { A2: 0.373, D4: 1.864, D3: 0.136 },
};

interface FinalSealingMeasurementTableProps {
  projectId: number;
  usl?: number | null;
  lsl?: number | null;
  onDataChange?: (rows: SealingMeasurementRow[]) => void;
}

function toMeasurementRows(
  data: { thicknesses: (number | null)[] }[],
  usl: number,
  lsl: number,
): SealingMeasurementRow[] {
  const validData = data.filter(d => d.thicknesses.some(v => v !== null && v !== undefined));
  if (validData.length === 0) return [];

  const rowBases = validData.map(d => {
    const raw: (number | null)[] = Array.from({ length: GROUP_SIZE }, (_, i) => d.thicknesses[i] ?? null);
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

export default function FinalSealingMeasurementTable({
  projectId,
  usl,
  lsl,
  onDataChange,
}: FinalSealingMeasurementTableProps) {
  const [rows, setRows] = useState<SealingMeasurementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getLQCFinalSealingData(projectId);
        const converted = toMeasurementRows(data, usl ?? 290, lsl ?? 250);
        setRows(converted);
        onDataChange?.(converted);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, usl, lsl]);

  if (loading) return <div style={{ padding: 16 }}>로딩 중...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>오류: {error}</div>;

  return (
    <>
      <SpcTable
        title="Final Sealing 검사"
        inspectionItem="두께"
        rows={rows}
        groupSize={rows.length > 0 ? Math.max(...rows.map(r => r.measurements.filter(v => v !== null).length)) : GROUP_SIZE}
        displaySize={GROUP_SIZE}
        checkRLcl={true}
        formatter={{
          xbar: v => v.toFixed(3),
          xbarCl: v => v.toFixed(7),
          xbarUcl: v => v.toFixed(7),
          xbarLcl: v => v.toFixed(3),
          rCl: v => v.toFixed(8),
          rUcl: v => v.toFixed(8),
          rLcl: v => v.toFixed(9),
          r: v => v.toFixed(0),
        }}
      />
      <ControlChartConstantsTable currentN={rows.length > 0 ? Math.max(...rows.map(r => r.measurements.filter(v => v !== null).length)) : GROUP_SIZE} />
    </>
  );
}
