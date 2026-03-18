import { useState, useEffect } from 'react';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';
import SpecEditModal from '../common/SpecEditModal';
import {
  getLQCSpecs,
  saveLQCSpec,
  getLQCSealingData,
  type SpecValue,
} from '../../../../../api/quality/LQCService';

interface SealingTopData {
  id: number;
  workDate: string;
  lot: string;
  sideSealing1: number | null;
  sideSealing2: number | null;
  sideSealing3: number | null;
  sideSealing4: number | null;
  sideSealing5: number | null;
  sideSealing6: number | null;
  topSealing1: number | null;
  topSealing2: number | null;
  topSealing3: number | null;
  topSealing4: number | null;
  topSealing5: number | null;
  topSealing6: number | null;
}

interface SealingTopTableProps {
  projectId: number;
}

const SEALING_TOP_SPEC_FIELDS = [
  { key: 'sideSealing', label: 'Side Sealing 두께', type: 'target-tolerance' as const, unit: '㎛' },
  { key: 'topSealing', label: 'Top(Tab) Sealing 두께', type: 'target-tolerance' as const, unit: '㎛' },
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
  if (value === null || value === undefined) return '-';
  if (isNaN(value)) return '-';
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
  const squaredDiffs = valid.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / valid.length);
};

const getSideSealingValues = (row: SealingTopData): (number | null)[] => [
  row.sideSealing1, row.sideSealing2, row.sideSealing3,
  row.sideSealing4, row.sideSealing5, row.sideSealing6,
];

const getTopSealingValues = (row: SealingTopData): (number | null)[] => [
  row.topSealing1, row.topSealing2, row.topSealing3,
  row.topSealing4, row.topSealing5, row.topSealing6,
];

export default function SealingTopTable({ projectId }: SealingTopTableProps) {
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [specs, setSpecs] = useState<Record<string, SpecValue>>({});
  const [data, setData] = useState<SealingTopData[]>([]);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specsData = await getLQCSpecs(projectId, 'ASSEMBLY_SEALING', 'SEALING');
        const spec = specsData.find(s => s.itemType === 'SEALING');
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
        const apiData = await getLQCSealingData(projectId);
        const mapped: SealingTopData[] = apiData.map(item => ({
          id: item.id,
          workDate: item.workDate,
          lot: item.lot,
          sideSealing1: item.sideSealing[0] ?? null,
          sideSealing2: item.sideSealing[1] ?? null,
          sideSealing3: item.sideSealing[2] ?? null,
          sideSealing4: item.sideSealing[3] ?? null,
          sideSealing5: item.sideSealing[4] ?? null,
          sideSealing6: item.sideSealing[5] ?? null,
          topSealing1: item.topSealing[0] ?? null,
          topSealing2: item.topSealing[1] ?? null,
          topSealing3: item.topSealing[2] ?? null,
          topSealing4: item.topSealing[3] ?? null,
          topSealing5: item.topSealing[4] ?? null,
          topSealing6: item.topSealing[5] ?? null,
        }));
        setData(mapped);
      } catch (error) {
        console.error('Failed to load sealing data:', error);
      }
    };
    loadData();
  }, [projectId]);

  const handleSaveSpec = async (newSpecs: Record<string, SpecValue>) => {
    try {
      await saveLQCSpec(projectId, 'ASSEMBLY_SEALING', 'SEALING', newSpecs);
      setSpecs(newSpecs);
      setIsSpecModalOpen(false);
    } catch (error) {
      console.error('Failed to save spec:', error);
    }
  };

  const hasData = data.length > 0;

  const rowAvgValues = data.map(row => ({
    sideAvg: calcAvg(getSideSealingValues(row)),
    topAvg: calcAvg(getTopSealingValues(row)),
  }));

  // Side Sealing 통계
  const sideStats = {
    avg: { avg: calcAvg(rowAvgValues.map(d => d.sideAvg)), c1: calcAvg(data.map(d => d.sideSealing1)), c2: calcAvg(data.map(d => d.sideSealing2)), c3: calcAvg(data.map(d => d.sideSealing3)), c4: calcAvg(data.map(d => d.sideSealing4)), c5: calcAvg(data.map(d => d.sideSealing5)), c6: calcAvg(data.map(d => d.sideSealing6)) },
    max: { avg: calcMax(rowAvgValues.map(d => d.sideAvg)), c1: calcMax(data.map(d => d.sideSealing1)), c2: calcMax(data.map(d => d.sideSealing2)), c3: calcMax(data.map(d => d.sideSealing3)), c4: calcMax(data.map(d => d.sideSealing4)), c5: calcMax(data.map(d => d.sideSealing5)), c6: calcMax(data.map(d => d.sideSealing6)) },
    min: { avg: calcMin(rowAvgValues.map(d => d.sideAvg)), c1: calcMin(data.map(d => d.sideSealing1)), c2: calcMin(data.map(d => d.sideSealing2)), c3: calcMin(data.map(d => d.sideSealing3)), c4: calcMin(data.map(d => d.sideSealing4)), c5: calcMin(data.map(d => d.sideSealing5)), c6: calcMin(data.map(d => d.sideSealing6)) },
    stdev: { avg: calcStdev(rowAvgValues.map(d => d.sideAvg)), c1: calcStdev(data.map(d => d.sideSealing1)), c2: calcStdev(data.map(d => d.sideSealing2)), c3: calcStdev(data.map(d => d.sideSealing3)), c4: calcStdev(data.map(d => d.sideSealing4)), c5: calcStdev(data.map(d => d.sideSealing5)), c6: calcStdev(data.map(d => d.sideSealing6)) },
  };

  // Top Sealing 통계
  const topStats = {
    avg: { avg: calcAvg(rowAvgValues.map(d => d.topAvg)), c1: calcAvg(data.map(d => d.topSealing1)), c2: calcAvg(data.map(d => d.topSealing2)), c3: calcAvg(data.map(d => d.topSealing3)), c4: calcAvg(data.map(d => d.topSealing4)), c5: calcAvg(data.map(d => d.topSealing5)), c6: calcAvg(data.map(d => d.topSealing6)) },
    max: { avg: calcMax(rowAvgValues.map(d => d.topAvg)), c1: calcMax(data.map(d => d.topSealing1)), c2: calcMax(data.map(d => d.topSealing2)), c3: calcMax(data.map(d => d.topSealing3)), c4: calcMax(data.map(d => d.topSealing4)), c5: calcMax(data.map(d => d.topSealing5)), c6: calcMax(data.map(d => d.topSealing6)) },
    min: { avg: calcMin(rowAvgValues.map(d => d.topAvg)), c1: calcMin(data.map(d => d.topSealing1)), c2: calcMin(data.map(d => d.topSealing2)), c3: calcMin(data.map(d => d.topSealing3)), c4: calcMin(data.map(d => d.topSealing4)), c5: calcMin(data.map(d => d.topSealing5)), c6: calcMin(data.map(d => d.topSealing6)) },
    stdev: { avg: calcStdev(rowAvgValues.map(d => d.topAvg)), c1: calcStdev(data.map(d => d.topSealing1)), c2: calcStdev(data.map(d => d.topSealing2)), c3: calcStdev(data.map(d => d.topSealing3)), c4: calcStdev(data.map(d => d.topSealing4)), c5: calcStdev(data.map(d => d.topSealing5)), c6: calcStdev(data.map(d => d.topSealing6)) },
  };

  // 규격 표시용
  const sideSpec = formatSpec(specs.sideSealing, 'target-tolerance');
  const topSpec = formatSpec(specs.topSealing, 'target-tolerance');

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>Sealing 검사</h3>
          <button className={styles.specButton} onClick={() => setIsSpecModalOpen(true)}>
            규격 설정
          </button>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className={styles.lqcTable}>
            <thead>
              <tr>
                <th rowSpan={2}>No.</th>
                <th rowSpan={2}>작업일자</th>
                <th rowSpan={2}>Lot no.</th>
                <th colSpan={7}>Side Sealing 두께 (㎛)</th>
                <th colSpan={7}>Top(Tab) Sealing 두께 (㎛)</th>
              </tr>
              <tr>
                <th>평균</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th>
                <th>평균</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th>
              </tr>
            </thead>
            <tbody>
              {/* 규격 행 */}
              <tr className={styles.specRow}>
                <td colSpan={3}>규격</td>
                <td colSpan={7}>{sideSpec}</td>
                <td colSpan={7}>{topSpec}</td>
              </tr>
              {/* Ave. 행 */}
              <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                <td colSpan={3}>Ave.</td>
                <td>{formatNumber(sideStats.avg.avg, 0)}</td>
                <td>{formatNumber(sideStats.avg.c1, 0)}</td>
                <td>{formatNumber(sideStats.avg.c2, 0)}</td>
                <td>{formatNumber(sideStats.avg.c3, 0)}</td>
                <td>{formatNumber(sideStats.avg.c4, 0)}</td>
                <td>{formatNumber(sideStats.avg.c5, 0)}</td>
                <td>{formatNumber(sideStats.avg.c6, 0)}</td>
                <td>{formatNumber(topStats.avg.avg, 0)}</td>
                <td>{formatNumber(topStats.avg.c1, 0)}</td>
                <td>{formatNumber(topStats.avg.c2, 0)}</td>
                <td>{formatNumber(topStats.avg.c3, 0)}</td>
                <td>{formatNumber(topStats.avg.c4, 0)}</td>
                <td>{formatNumber(topStats.avg.c5, 0)}</td>
                <td>{formatNumber(topStats.avg.c6, 0)}</td>
              </tr>
              {/* Max. 행 */}
              <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                <td colSpan={3}>Max.</td>
                <td>{formatNumber(sideStats.max.avg, 0)}</td>
                <td>{formatNumber(sideStats.max.c1, 0)}</td>
                <td>{formatNumber(sideStats.max.c2, 0)}</td>
                <td>{formatNumber(sideStats.max.c3, 0)}</td>
                <td>{formatNumber(sideStats.max.c4, 0)}</td>
                <td>{formatNumber(sideStats.max.c5, 0)}</td>
                <td>{formatNumber(sideStats.max.c6, 0)}</td>
                <td>{formatNumber(topStats.max.avg, 0)}</td>
                <td>{formatNumber(topStats.max.c1, 0)}</td>
                <td>{formatNumber(topStats.max.c2, 0)}</td>
                <td>{formatNumber(topStats.max.c3, 0)}</td>
                <td>{formatNumber(topStats.max.c4, 0)}</td>
                <td>{formatNumber(topStats.max.c5, 0)}</td>
                <td>{formatNumber(topStats.max.c6, 0)}</td>
              </tr>
              {/* Min. 행 */}
              <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                <td colSpan={3}>Min.</td>
                <td>{formatNumber(sideStats.min.avg, 0)}</td>
                <td>{formatNumber(sideStats.min.c1, 0)}</td>
                <td>{formatNumber(sideStats.min.c2, 0)}</td>
                <td>{formatNumber(sideStats.min.c3, 0)}</td>
                <td>{formatNumber(sideStats.min.c4, 0)}</td>
                <td>{formatNumber(sideStats.min.c5, 0)}</td>
                <td>{formatNumber(sideStats.min.c6, 0)}</td>
                <td>{formatNumber(topStats.min.avg, 0)}</td>
                <td>{formatNumber(topStats.min.c1, 0)}</td>
                <td>{formatNumber(topStats.min.c2, 0)}</td>
                <td>{formatNumber(topStats.min.c3, 0)}</td>
                <td>{formatNumber(topStats.min.c4, 0)}</td>
                <td>{formatNumber(topStats.min.c5, 0)}</td>
                <td>{formatNumber(topStats.min.c6, 0)}</td>
              </tr>
              {/* Stdev. 행 */}
              <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                <td colSpan={3}>Stdev.</td>
                <td>{formatNumber(sideStats.stdev.avg, 3)}</td>
                <td>{formatNumber(sideStats.stdev.c1, 3)}</td>
                <td>{formatNumber(sideStats.stdev.c2, 3)}</td>
                <td>{formatNumber(sideStats.stdev.c3, 3)}</td>
                <td>{formatNumber(sideStats.stdev.c4, 3)}</td>
                <td>{formatNumber(sideStats.stdev.c5, 3)}</td>
                <td>{formatNumber(sideStats.stdev.c6, 3)}</td>
                <td>{formatNumber(topStats.stdev.avg, 3)}</td>
                <td>{formatNumber(topStats.stdev.c1, 3)}</td>
                <td>{formatNumber(topStats.stdev.c2, 3)}</td>
                <td>{formatNumber(topStats.stdev.c3, 3)}</td>
                <td>{formatNumber(topStats.stdev.c4, 3)}</td>
                <td>{formatNumber(topStats.stdev.c5, 3)}</td>
                <td>{formatNumber(topStats.stdev.c6, 3)}</td>
              </tr>
              {/* 데이터 행 */}
              {hasData ? (
                data.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{row.workDate}</td>
                    <td>{row.lot}</td>
                    <td>{formatNumber(rowAvgValues[index].sideAvg, 0)}</td>
                    <td>{formatNumber(row.sideSealing1, 0)}</td>
                    <td>{formatNumber(row.sideSealing2, 0)}</td>
                    <td>{formatNumber(row.sideSealing3, 0)}</td>
                    <td>{formatNumber(row.sideSealing4, 0)}</td>
                    <td>{formatNumber(row.sideSealing5, 0)}</td>
                    <td>{formatNumber(row.sideSealing6, 0)}</td>
                    <td>{formatNumber(rowAvgValues[index].topAvg, 0)}</td>
                    <td>{formatNumber(row.topSealing1, 0)}</td>
                    <td>{formatNumber(row.topSealing2, 0)}</td>
                    <td>{formatNumber(row.topSealing3, 0)}</td>
                    <td>{formatNumber(row.topSealing4, 0)}</td>
                    <td>{formatNumber(row.topSealing5, 0)}</td>
                    <td>{formatNumber(row.topSealing6, 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={17} className={styles.noDataRow}>데이터 없음</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpec}
        title="Sealing 검사"
        specFields={SEALING_TOP_SPEC_FIELDS}
        specs={specs}
      />
    </div>
  );
}
