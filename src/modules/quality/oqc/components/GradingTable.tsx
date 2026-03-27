import { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  getOQCGradingData,
  getOQCSpec,
  saveOQCSpec,
  type GradingCell,
  type SpecValue,
} from '../../../../api/quality/OQCService';
import styles from '../../../../styles/quality/oqc/OQCTable.module.css';
import SpecEditModal from '../../lqc/components/common/SpecEditModal';

const ROW_HEIGHT = 32;
const TABLE_HEIGHT = 600;


const SPEC_FIELDS = [
  { key: 'capacity', label: '기준용량',             type: 'min-only'  as const, unit: 'Ah' },
  { key: 'acIr',     label: 'AC-IR',                type: 'max-only'  as const, unit: 'mΩ' },
  { key: 'ocv3',     label: 'OCV3 (출하충전)',       type: 'min-only'  as const, unit: 'V'  },
  { key: 'ocv4',     label: 'OCV4 (장기보관)',       type: 'range'     as const, unit: 'V'  },
  { key: 'deltaV',   label: '△V',                   type: 'max-only'  as const, unit: 'mV' },
];

const isOutOfSpec = (val: number | null, lsl?: number, usl?: number): boolean => {
  if (val === null) return false;
  if (lsl !== undefined && val < lsl) return true;
  if (usl !== undefined && val > usl) return true;
  return false;
};

const stdevP = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length);
};

const formatSpec = (spec: SpecValue | undefined): string => {
  if (!spec) return '-';
  if (spec.min !== undefined && spec.max !== undefined) return `${spec.min} ~ ${spec.max}`;
  if (spec.min !== undefined) return `≥${spec.min}`;
  if (spec.max !== undefined) return `≤${spec.max}`;
  return '-';
};

interface GradingTableProps {
  projectId: number;
}

export default function GradingTable({ projectId }: GradingTableProps) {
  const [rows, setRows] = useState<GradingCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specs, setSpecs] = useState<Record<string, SpecValue>>({});
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specsData = await getOQCSpec(projectId, 'GRADING');
        if (specsData.length > 0) setSpecs(specsData[0].specs);
      } catch {
        // fallback to defaults
      }
    };
    loadSpecs();
  }, [projectId]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getOQCGradingData(projectId);
        setRows(data.map(r => ({
          ...r,
          capacity: Number(r.capacity),
          acIr: Number(r.acIr),
          ocv3: Number(r.ocv3),
          ocv4: r.ocv4 !== null ? Number(r.ocv4) : null,
          deltaV: r.deltaV !== null ? Number(r.deltaV) : null,
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const handleSaveSpec = async (newSpecs: Record<string, SpecValue>) => {
    try {
      await saveOQCSpec(projectId, 'GRADING', 'GRADING', newSpecs);
      setSpecs(newSpecs);
    } catch (err) {
      console.error('Failed to save spec:', err);
    }
  };

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  if (loading) return <div style={{ padding: 16 }}>로딩 중...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>오류: {error}</div>;

  const hasData = rows.length > 0;

  const capacityNums = rows.map(r => r.capacity);
  const acIrNums     = rows.map(r => r.acIr);
  const ocv3Nums     = rows.map(r => r.ocv3);
  const ocv4Nums     = rows.filter(r => r.ocv4 !== null).map(r => r.ocv4 as number);
  const deltaVNums   = rows.filter(r => r.deltaV !== null).map(r => r.deltaV as number);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const max = (arr: number[]) => arr.length ? Math.max(...arr) : null;
  const min = (arr: number[]) => arr.length ? Math.min(...arr) : null;

  const stats = {
    capacity: { avg: avg(capacityNums), max: max(capacityNums), min: min(capacityNums), stdev: stdevP(capacityNums) },
    acIr:     { avg: avg(acIrNums),     max: max(acIrNums),     min: min(acIrNums),     stdev: stdevP(acIrNums)     },
    ocv3:     { avg: avg(ocv3Nums),     max: max(ocv3Nums),     min: min(ocv3Nums),     stdev: stdevP(ocv3Nums)     },
    ocv4:     { avg: avg(ocv4Nums),     max: max(ocv4Nums),     min: min(ocv4Nums),     stdev: stdevP(ocv4Nums)     },
    deltaV:   { avg: avg(deltaVNums),   max: max(deltaVNums),   min: min(deltaVNums),   stdev: stdevP(deltaVNums)   },
  };

  const fmt2  = (v: number | null) => v === null ? '-' : v.toFixed(2);
  const fmt3  = (v: number | null) => v === null ? '-' : v.toFixed(3);
  const fmt1  = (v: number | null) => v === null ? '-' : v.toFixed(1);

  const capacityLsl = specs['capacity']?.min;
  const acIrUsl     = specs['acIr']?.max;
  const ocv3Lsl     = specs['ocv3']?.min;
  const ocv4Lsl     = specs['ocv4']?.min;
  const ocv4Usl     = specs['ocv4']?.max;
  const deltaVUsl   = specs['deltaV']?.max;

  return (
    <>
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>● Grading</h3>
          <button className={styles.specButton} onClick={() => setIsSpecModalOpen(true)}>
            규격 설정
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <div
            ref={parentRef}
            style={{ height: TABLE_HEIGHT, overflowY: 'auto', position: 'relative' }}
          >
            <table className={styles.lqcTable} style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '60px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '200px' }} />
                <col style={{ width: '100px' }} />
              </colgroup>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#fff' }}>
                {/* 행1: 컬럼명 */}
                <tr>
                  <th rowSpan={2}>No.</th>
                  <th rowSpan={2}>Lot no.</th>
                  <th>기준용량</th>
                  <th>AC-IR</th>
                  <th>OCV3</th>
                  <th>OCV4</th>
                  <th>△V</th>
                </tr>
                {/* 행3: 단위 */}
                <tr>
                  <th>(Ah)</th>
                  <th>(mΩ)</th>
                  <th>(V)</th>
                  <th>(V)</th>
                  <th>(mV)</th>
                </tr>
                {/* 규격 행 */}
                <tr className={styles.specRow}>
                  <td colSpan={2}>규격</td>
                  <td>{formatSpec(specs['capacity'])}</td>
                  <td>{formatSpec(specs['acIr'])}</td>
                  <td>{formatSpec(specs['ocv3'])}</td>
                  <td>TBD</td>
                  <td>{formatSpec(specs['deltaV'])}</td>
                </tr>
                {/* 통계 행 */}
                {hasData && (
                  <>
                    <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                      <td colSpan={2}>Ave.</td>
                      <td>{fmt2(stats.capacity.avg)}</td>
                      <td>{fmt3(stats.acIr.avg)}</td>
                      <td>{fmt3(stats.ocv3.avg)}</td>
                      <td>{fmt3(stats.ocv4.avg)}</td>
                      <td>{fmt1(stats.deltaV.avg)}</td>
                    </tr>
                    <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                      <td colSpan={2}>Max.</td>
                      <td>{fmt2(stats.capacity.max)}</td>
                      <td>{fmt3(stats.acIr.max)}</td>
                      <td>{fmt3(stats.ocv3.max)}</td>
                      <td>{fmt3(stats.ocv4.max)}</td>
                      <td>{fmt1(stats.deltaV.max)}</td>
                    </tr>
                    <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                      <td colSpan={2}>Min.</td>
                      <td>{fmt2(stats.capacity.min)}</td>
                      <td>{fmt3(stats.acIr.min)}</td>
                      <td>{fmt3(stats.ocv3.min)}</td>
                      <td>{fmt3(stats.ocv4.min)}</td>
                      <td>{fmt1(stats.deltaV.min)}</td>
                    </tr>
                    <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                      <td colSpan={2}>Stdev.</td>
                      <td>{fmt2(stats.capacity.stdev)}</td>
                      <td>{fmt3(stats.acIr.stdev)}</td>
                      <td>{fmt3(stats.ocv3.stdev)}</td>
                      <td>{fmt3(stats.ocv4.stdev)}</td>
                      <td>{fmt1(stats.deltaV.stdev)}</td>
                    </tr>
                  </>
                )}
              </thead>
              <tbody>
                {!hasData ? (
                  <tr>
                    <td colSpan={7} className={styles.noDataRow}>데이터 없음</td>
                  </tr>
                ) : (
                  <>
                    <tr style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }}>
                      <td colSpan={7} style={{ padding: 0, border: 'none' }} />
                    </tr>
                    {virtualizer.getVirtualItems().map(virtualRow => {
                      const row = rows[virtualRow.index];
                      return (
                        <tr key={virtualRow.key} style={{ height: ROW_HEIGHT }}>
                          <td>{virtualRow.index + 1}</td>
                          <td>{row.lotNo}</td>
                          <td style={isOutOfSpec(row.capacity, capacityLsl, undefined) ? { color: '#dc2626' } : undefined}>
                            {row.capacity.toFixed(2)}
                          </td>
                          <td style={isOutOfSpec(row.acIr, undefined, acIrUsl) ? { color: '#dc2626' } : undefined}>
                            {row.acIr.toFixed(3)}
                          </td>
                          <td style={isOutOfSpec(row.ocv3, ocv3Lsl, undefined) ? { color: '#dc2626' } : undefined}>
                            {row.ocv3.toFixed(3)}
                          </td>
                          <td style={isOutOfSpec(row.ocv4, ocv4Lsl, ocv4Usl) ? { color: '#dc2626' } : undefined}>
                            {row.ocv4 !== null ? row.ocv4.toFixed(3) : '-'}
                          </td>
                          <td style={isOutOfSpec(row.deltaV, undefined, deltaVUsl) ? { color: '#dc2626' } : undefined}>
                            {row.deltaV !== null ? row.deltaV.toFixed(1) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ height: virtualizer.getTotalSize() - (virtualizer.getVirtualItems().at(-1)?.end ?? 0) }}>
                      <td colSpan={7} style={{ padding: 0, border: 'none' }} />
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpec}
        title="Grading"
        specs={specs}
        specFields={SPEC_FIELDS}
      />
    </>
  );
}
