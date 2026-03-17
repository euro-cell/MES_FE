import { useState, useEffect } from 'react';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';
import SpecEditModal from './SpecEditModal';
import {
  getLQCSpecs,
  saveLQCSpec,
  type SpecValue,
} from '../../../../api/quality/LQCService';

interface FinalSealingData {
  id: number;
  workDate: string;
  lot: string;
  shift: string;
  thickness1: number | null;
  thickness2: number | null;
  thickness3: number | null;
  thickness4: number | null;
  thickness5: number | null;
  thickness6: number | null;
  thickness7: number | null;
  thickness8: number | null;
  thickness9: number | null;
  thickness10: number | null;
}

interface FinalSealingTableProps {
  projectId: number;
}

const FINAL_SEALING_SPEC_FIELDS = [
  { key: 'thickness', label: 'Final Sealing 두께', type: 'target-tolerance' as const, unit: '㎛' },
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
  if (value === null || value === undefined || isNaN(value)) return '-';
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
  return Math.sqrt(valid.map(v => Math.pow(v - avg, 2)).reduce((a, b) => a + b, 0) / valid.length);
};

const getThicknessValues = (row: FinalSealingData): (number | null)[] => [
  row.thickness1, row.thickness2, row.thickness3, row.thickness4, row.thickness5,
  row.thickness6, row.thickness7, row.thickness8, row.thickness9, row.thickness10,
];

export default function FinalSealingTable({ projectId }: FinalSealingTableProps) {
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [specs, setSpecs] = useState<Record<string, SpecValue>>({});
  const [data, setData] = useState<FinalSealingData[]>([]);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specsData = await getLQCSpecs(projectId, 'AssemblyFinalSealing', 'finalSealing');
        const spec = specsData.find(s => s.itemType === 'finalSealing');
        if (spec) setSpecs(spec.specs);
      } catch (error) {
        console.error('Failed to load specs:', error);
      }
    };
    loadSpecs();
  }, [projectId]);

  // TODO: 서비스단 연동 시 API 호출 추가
  useEffect(() => {
    setData([]);
  }, [projectId]);

  const handleSaveSpec = async (newSpecs: Record<string, SpecValue>) => {
    try {
      await saveLQCSpec(projectId, 'AssemblyFinalSealing', 'finalSealing', newSpecs);
      setSpecs(newSpecs);
      setIsSpecModalOpen(false);
    } catch (error) {
      console.error('Failed to save spec:', error);
    }
  };

  const hasData = data.length > 0;

  const rowAvgs = data.map(row => calcAvg(getThicknessValues(row)));

  const stats = {
    avg: {
      avg: calcAvg(rowAvgs),
      c1: calcAvg(data.map(d => d.thickness1)), c2: calcAvg(data.map(d => d.thickness2)),
      c3: calcAvg(data.map(d => d.thickness3)), c4: calcAvg(data.map(d => d.thickness4)),
      c5: calcAvg(data.map(d => d.thickness5)), c6: calcAvg(data.map(d => d.thickness6)),
      c7: calcAvg(data.map(d => d.thickness7)), c8: calcAvg(data.map(d => d.thickness8)),
      c9: calcAvg(data.map(d => d.thickness9)), c10: calcAvg(data.map(d => d.thickness10)),
    },
    max: {
      avg: calcMax(rowAvgs),
      c1: calcMax(data.map(d => d.thickness1)), c2: calcMax(data.map(d => d.thickness2)),
      c3: calcMax(data.map(d => d.thickness3)), c4: calcMax(data.map(d => d.thickness4)),
      c5: calcMax(data.map(d => d.thickness5)), c6: calcMax(data.map(d => d.thickness6)),
      c7: calcMax(data.map(d => d.thickness7)), c8: calcMax(data.map(d => d.thickness8)),
      c9: calcMax(data.map(d => d.thickness9)), c10: calcMax(data.map(d => d.thickness10)),
    },
    min: {
      avg: calcMin(rowAvgs),
      c1: calcMin(data.map(d => d.thickness1)), c2: calcMin(data.map(d => d.thickness2)),
      c3: calcMin(data.map(d => d.thickness3)), c4: calcMin(data.map(d => d.thickness4)),
      c5: calcMin(data.map(d => d.thickness5)), c6: calcMin(data.map(d => d.thickness6)),
      c7: calcMin(data.map(d => d.thickness7)), c8: calcMin(data.map(d => d.thickness8)),
      c9: calcMin(data.map(d => d.thickness9)), c10: calcMin(data.map(d => d.thickness10)),
    },
    stdev: {
      avg: calcStdev(rowAvgs),
      c1: calcStdev(data.map(d => d.thickness1)), c2: calcStdev(data.map(d => d.thickness2)),
      c3: calcStdev(data.map(d => d.thickness3)), c4: calcStdev(data.map(d => d.thickness4)),
      c5: calcStdev(data.map(d => d.thickness5)), c6: calcStdev(data.map(d => d.thickness6)),
      c7: calcStdev(data.map(d => d.thickness7)), c8: calcStdev(data.map(d => d.thickness8)),
      c9: calcStdev(data.map(d => d.thickness9)), c10: calcStdev(data.map(d => d.thickness10)),
    },
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>Final Sealing 검사</h3>
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
                <th rowSpan={2}>Shift</th>
                <th colSpan={11}>Final Sealing 두께 (㎛)</th>
              </tr>
              <tr>
                <th>평균</th>
                <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th>
                <th>6</th><th>7</th><th>8</th><th>9</th><th>10</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.specRow}>
                <td colSpan={4}>규격</td>
                <td colSpan={11}>{formatSpec(specs.thickness, 'target-tolerance')}</td>
              </tr>
              <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                <td colSpan={4}>Ave.</td>
                <td>{formatNumber(stats.avg.avg, 0)}</td>
                <td>{formatNumber(stats.avg.c1, 0)}</td><td>{formatNumber(stats.avg.c2, 0)}</td>
                <td>{formatNumber(stats.avg.c3, 0)}</td><td>{formatNumber(stats.avg.c4, 0)}</td>
                <td>{formatNumber(stats.avg.c5, 0)}</td><td>{formatNumber(stats.avg.c6, 0)}</td>
                <td>{formatNumber(stats.avg.c7, 0)}</td><td>{formatNumber(stats.avg.c8, 0)}</td>
                <td>{formatNumber(stats.avg.c9, 0)}</td><td>{formatNumber(stats.avg.c10, 0)}</td>
              </tr>
              <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                <td colSpan={4}>Max.</td>
                <td>{formatNumber(stats.max.avg, 0)}</td>
                <td>{formatNumber(stats.max.c1, 0)}</td><td>{formatNumber(stats.max.c2, 0)}</td>
                <td>{formatNumber(stats.max.c3, 0)}</td><td>{formatNumber(stats.max.c4, 0)}</td>
                <td>{formatNumber(stats.max.c5, 0)}</td><td>{formatNumber(stats.max.c6, 0)}</td>
                <td>{formatNumber(stats.max.c7, 0)}</td><td>{formatNumber(stats.max.c8, 0)}</td>
                <td>{formatNumber(stats.max.c9, 0)}</td><td>{formatNumber(stats.max.c10, 0)}</td>
              </tr>
              <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                <td colSpan={4}>Min.</td>
                <td>{formatNumber(stats.min.avg, 0)}</td>
                <td>{formatNumber(stats.min.c1, 0)}</td><td>{formatNumber(stats.min.c2, 0)}</td>
                <td>{formatNumber(stats.min.c3, 0)}</td><td>{formatNumber(stats.min.c4, 0)}</td>
                <td>{formatNumber(stats.min.c5, 0)}</td><td>{formatNumber(stats.min.c6, 0)}</td>
                <td>{formatNumber(stats.min.c7, 0)}</td><td>{formatNumber(stats.min.c8, 0)}</td>
                <td>{formatNumber(stats.min.c9, 0)}</td><td>{formatNumber(stats.min.c10, 0)}</td>
              </tr>
              <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                <td colSpan={4}>Stdev.</td>
                <td>{formatNumber(stats.stdev.avg, 3)}</td>
                <td>{formatNumber(stats.stdev.c1, 3)}</td><td>{formatNumber(stats.stdev.c2, 3)}</td>
                <td>{formatNumber(stats.stdev.c3, 3)}</td><td>{formatNumber(stats.stdev.c4, 3)}</td>
                <td>{formatNumber(stats.stdev.c5, 3)}</td><td>{formatNumber(stats.stdev.c6, 3)}</td>
                <td>{formatNumber(stats.stdev.c7, 3)}</td><td>{formatNumber(stats.stdev.c8, 3)}</td>
                <td>{formatNumber(stats.stdev.c9, 3)}</td><td>{formatNumber(stats.stdev.c10, 3)}</td>
              </tr>
              {hasData ? (
                data.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{row.workDate}</td>
                    <td>{row.lot}</td>
                    <td>{row.shift}</td>
                    <td>{formatNumber(rowAvgs[index], 0)}</td>
                    <td>{formatNumber(row.thickness1, 0)}</td>
                    <td>{formatNumber(row.thickness2, 0)}</td>
                    <td>{formatNumber(row.thickness3, 0)}</td>
                    <td>{formatNumber(row.thickness4, 0)}</td>
                    <td>{formatNumber(row.thickness5, 0)}</td>
                    <td>{formatNumber(row.thickness6, 0)}</td>
                    <td>{formatNumber(row.thickness7, 0)}</td>
                    <td>{formatNumber(row.thickness8, 0)}</td>
                    <td>{formatNumber(row.thickness9, 0)}</td>
                    <td>{formatNumber(row.thickness10, 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className={styles.noDataRow}>데이터 없음</td>
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
        title="Final Sealing 검사"
        specFields={FINAL_SEALING_SPEC_FIELDS}
        specs={specs}
      />
    </div>
  );
}
