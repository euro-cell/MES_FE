import { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { getLQCPreFormationData, type PreFormationItem } from '../../../../../api/quality/LQCService';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';
import PreFormationNormalDistTable from './PreFormationNormalDistTable';

interface PreFormationTableProps {
  projectId: number;
}

const toNum = (v: string): number => parseFloat(v);

const fmt4 = (v: number): string => {
  if (isNaN(v)) return '-';
  return v.toFixed(4);
};

const calcAvg = (nums: number[]): number => nums.reduce((a, b) => a + b, 0) / nums.length;
const calcMax = (nums: number[]): number => Math.max(...nums);
const calcMin = (nums: number[]): number => Math.min(...nums);
const calcStdev = (nums: number[]): number => {
  const avg = calcAvg(nums);
  return Math.sqrt(nums.map(v => Math.pow(v - avg, 2)).reduce((a, b) => a + b, 0) / nums.length);
};

const ROW_HEIGHT = 35;
const TABLE_HEIGHT = 600;

export default function PreFormationTable({ projectId }: PreFormationTableProps) {
  const [items, setItems] = useState<PreFormationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getLQCPreFormationData(projectId);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  if (loading) return <div style={{ padding: 16 }}>로딩 중...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>오류: {error}</div>;

  const pfcNums = items.map(d => toNum(d.pfc));
  const pfdNums = items.map(d => toNum(d.pfd));
  const hasData = items.length > 0;

  return (
    <>
    <div className={styles.tableSection}>
      <h3 className={styles.tableTitle}>● Pre-Formation</h3>
      <div className={styles.tableWrapper}>
        <div
          ref={parentRef}
          style={{ height: TABLE_HEIGHT, overflowY: 'auto', position: 'relative' }}
        >
          <table className={styles.lqcTable} style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '80px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '140px' }} />
            </colgroup>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#fff' }}>
              <tr>
                <th rowSpan={2}>No.</th>
                <th rowSpan={2}>Lot no.</th>
                <th colSpan={2}>용량 (Ah)</th>
              </tr>
              <tr>
                <th>충전</th>
                <th>방전</th>
              </tr>
              <tr className={styles.specRow}>
                <td colSpan={2}>규격</td>
                <td>-</td>
                <td>-</td>
              </tr>
              {hasData && (
                <>
                  <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                    <td colSpan={2}>Ave.</td>
                    <td>{fmt4(calcAvg(pfcNums))}</td>
                    <td>{fmt4(calcAvg(pfdNums))}</td>
                  </tr>
                  <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                    <td colSpan={2}>Max.</td>
                    <td>{fmt4(calcMax(pfcNums))}</td>
                    <td>{fmt4(calcMax(pfdNums))}</td>
                  </tr>
                  <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                    <td colSpan={2}>Min.</td>
                    <td>{fmt4(calcMin(pfcNums))}</td>
                    <td>{fmt4(calcMin(pfdNums))}</td>
                  </tr>
                  <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                    <td colSpan={2}>Stdev.</td>
                    <td>{fmt4(calcStdev(pfcNums))}</td>
                    <td>{fmt4(calcStdev(pfdNums))}</td>
                  </tr>
                </>
              )}
            </thead>
            <tbody>
              {!hasData ? (
                <tr>
                  <td colSpan={4} className={styles.noDataRow}>데이터 없음</td>
                </tr>
              ) : (
                <>
                  <tr style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }}>
                    <td colSpan={4} style={{ padding: 0, border: 'none' }} />
                  </tr>
                  {virtualizer.getVirtualItems().map(virtualRow => {
                    const item = items[virtualRow.index];
                    return (
                      <tr key={virtualRow.key} style={{ height: ROW_HEIGHT }}>
                        <td>{virtualRow.index + 1}</td>
                        <td>{item.lot}</td>
                        <td>{fmt4(toNum(item.pfc))}</td>
                        <td>{fmt4(toNum(item.pfd))}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ height: virtualizer.getTotalSize() - (virtualizer.getVirtualItems().at(-1)?.end ?? 0) }}>
                    <td colSpan={4} style={{ padding: 0, border: 'none' }} />
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <PreFormationNormalDistTable
      chargeData={pfcNums}
      dischargeData={pfdNums}
    />
    </>
  );
}
