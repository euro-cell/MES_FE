import { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  getLQCMainFormationData,
  getLQCSpecs,
  saveLQCSpec,
  type MainFormationItem,
  type SpecValue,
} from '../../../../../api/quality/LQCService';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';
import SpecEditModal from '../common/SpecEditModal';
import MainFormationNormalDistTable from './MainFormationNormalDistTable';
import DistributionChart from './DistributionChart';
import { calcMean, calcStdev, calcFrequency, calcDensity, toDistPoints } from './preFormationCalc';

const DISCHARGE_INTERVAL = 0.2;
const OCV2_INTERVAL = 0.005;
const MF_DISCHARGE_CLASSES = Array.from({ length: 41 }, (_, i) =>
  parseFloat((34 + i * DISCHARGE_INTERVAL).toFixed(1))
);
const MF_OCV2_CLASSES = Array.from({ length: 41 }, (_, i) =>
  parseFloat((2.5 + i * OCV2_INTERVAL).toFixed(3))
);

interface MainFormationTableProps {
  projectId: number;
}

const toNum = (v: string): number => parseFloat(v);
const fmt = (v: number): string => (isNaN(v) ? '-' : parseFloat(v.toPrecision(15)).toString());
const fmt4 = (v: number): string => (isNaN(v) ? '-' : v.toFixed(4));
const calcAvg = (nums: number[]): number => nums.reduce((a, b) => a + b, 0) / nums.length;
const calcMax = (nums: number[]): number => Math.max(...nums);
const calcMin = (nums: number[]): number => Math.min(...nums);

const ROW_HEIGHT = 35;
const TABLE_HEIGHT = 600;

const SPEC_FIELDS = [
  { key: 'ocv2', label: 'OCV2', type: 'min-only' as const, unit: 'V' },
];

const formatOcv2Spec = (spec: SpecValue | undefined): string => {
  if (!spec || spec.min === undefined) return '-';
  return `≥${spec.min}`;
};

export default function MainFormationTable({ projectId }: MainFormationTableProps) {
  const [items, setItems] = useState<MainFormationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specs, setSpecs] = useState<Record<string, SpecValue>>({});
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specsData = await getLQCSpecs(projectId, 'FORMATION_MAIN', 'OCV');
        const spec = specsData.find(s => s.itemType === 'OCV');
        if (spec) setSpecs(spec.specs);
      } catch (err) {
        console.error('Failed to load specs:', err);
      }
    };
    loadSpecs();
  }, [projectId]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getLQCMainFormationData(projectId);
        setItems(data);
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
      await saveLQCSpec(projectId, 'FORMATION_MAIN', 'OCV', newSpecs);
      setSpecs(newSpecs);
      setIsSpecModalOpen(false);
    } catch (err) {
      console.error('Failed to save spec:', err);
    }
  };

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  if (loading) return <div style={{ padding: 16 }}>로딩 중...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>오류: {error}</div>;

  const hasData = items.length > 0;
  const mfcNums = items.map(d => toNum(d.mfc));
  const mfdNums = items.map(d => toNum(d.mfd));
  const ocv1Nums = items.map(d => toNum(d.ocv1));
  const ocv2Nums = items.map(d => toNum(d.ocv2));
  const dvNums = items.map(d => toNum(d.ocv1) - toNum(d.ocv2));

  const mfcMean = hasData ? calcAvg(mfcNums) : 0;
  const mfdMean = hasData ? calcAvg(mfdNums) : 0;
  const ocv1Mean = hasData ? calcAvg(ocv1Nums) : 0;
  const ocv2Mean = hasData ? calcAvg(ocv2Nums) : 0;
  const dvMean = hasData ? calcAvg(dvNums) : 0;

  const ocv2SpecVal = specs['ocv2']?.min;

  // 차트 데이터
  const mfdMean2 = hasData ? calcMean(mfdNums) : 0;
  const mfdStdev = hasData ? calcStdev(mfdNums, mfdMean2) : 0;
  const ocv2Mean2 = hasData ? calcMean(ocv2Nums) : 0;
  const ocv2Stdev = hasData ? calcStdev(ocv2Nums, ocv2Mean2) : 0;

  const mfdFreq = hasData ? calcFrequency(mfdNums, MF_DISCHARGE_CLASSES) : [];
  const ocv2Freq = hasData ? calcFrequency(ocv2Nums, MF_OCV2_CLASSES) : [];
  const mfdDensity = hasData ? calcDensity(MF_DISCHARGE_CLASSES, mfdMean2, mfdStdev, DISCHARGE_INTERVAL) : [];
  const ocv2DensityVals = hasData ? calcDensity(MF_OCV2_CLASSES, ocv2Mean2, ocv2Stdev, OCV2_INTERVAL) : [];

  const mfdDistData = toDistPoints(MF_DISCHARGE_CLASSES, mfdFreq);
  const mfdNormalData = toDistPoints(MF_DISCHARGE_CLASSES, mfdDensity);
  const ocv2DistData = toDistPoints(MF_OCV2_CLASSES, ocv2Freq);
  const ocv2NormalData = toDistPoints(MF_OCV2_CLASSES, ocv2DensityVals);

  return (
    <>
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>● Main-Formation</h3>
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
                <col style={{ width: '160px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '120px' }} />
              </colgroup>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#fff' }}>
                <tr>
                  <th rowSpan={2}>No.</th>
                  <th rowSpan={2}>Lot no.</th>
                  <th colSpan={2}>용량 (Ah)</th>
                  <th colSpan={3}>OCV (V)</th>
                </tr>
                <tr>
                  <th>충전</th>
                  <th>방전</th>
                  <th>OCV1</th>
                  <th>OCV2</th>
                  <th>△V</th>
                </tr>
                <tr className={styles.specRow}>
                  <td colSpan={2}>규격</td>
                  <td>N/A</td>
                  <td>N/A</td>
                  <td>N/A</td>
                  <td>{formatOcv2Spec(specs['ocv2'])}</td>
                  <td>TBD</td>
                </tr>
                {hasData && (
                  <>
                    <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                      <td colSpan={2}>Ave.</td>
                      <td>{fmt4(mfcMean)}</td>
                      <td>{fmt4(mfdMean)}</td>
                      <td>{fmt4(ocv1Mean)}</td>
                      <td>{fmt4(ocv2Mean)}</td>
                      <td>{fmt4(dvMean)}</td>
                    </tr>
                    <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                      <td colSpan={2}>Max.</td>
                      <td>{fmt(calcMax(mfcNums))}</td>
                      <td>{fmt(calcMax(mfdNums))}</td>
                      <td>{fmt(calcMax(ocv1Nums))}</td>
                      <td>{fmt(calcMax(ocv2Nums))}</td>
                      <td>{fmt(calcMax(dvNums))}</td>
                    </tr>
                    <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                      <td colSpan={2}>Min.</td>
                      <td>{fmt(calcMin(mfcNums))}</td>
                      <td>{fmt(calcMin(mfdNums))}</td>
                      <td>{fmt(calcMin(ocv1Nums))}</td>
                      <td>{fmt(calcMin(ocv2Nums))}</td>
                      <td>{fmt(calcMin(dvNums))}</td>
                    </tr>
                    <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                      <td colSpan={2}>Stdev.</td>
                      <td>{fmt4(calcStdev(mfcNums, mfcMean))}</td>
                      <td>{fmt4(calcStdev(mfdNums, mfdMean))}</td>
                      <td>{fmt4(calcStdev(ocv1Nums, ocv1Mean))}</td>
                      <td>{fmt4(calcStdev(ocv2Nums, ocv2Mean))}</td>
                      <td>{fmt4(calcStdev(dvNums, dvMean))}</td>
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
                      const item = items[virtualRow.index];
                      const ocv2Val = toNum(item.ocv2);
                      const ocv2OOC = ocv2SpecVal !== undefined && ocv2Val < ocv2SpecVal;
                      return (
                        <tr key={virtualRow.key} style={{ height: ROW_HEIGHT }}>
                          <td>{virtualRow.index + 1}</td>
                          <td>{item.lot}</td>
                          <td>{fmt(toNum(item.mfc))}</td>
                          <td>{fmt(toNum(item.mfd))}</td>
                          <td>{fmt(toNum(item.ocv1))}</td>
                          <td style={ocv2OOC ? { backgroundColor: '#FFA500' } : undefined}>
                            {fmt(ocv2Val)}
                          </td>
                          <td>{fmt(toNum(item.ocv1) - toNum(item.ocv2))}</td>
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

      <MainFormationNormalDistTable
        dischargeData={mfdNums}
        ocv2Data={ocv2Nums}
      />

      {hasData && (
        <div className={styles.tableSection}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <DistributionChart
              title="MF_Discharge 분포"
              data={mfdDistData}
              xMin={34} xMax={42} xStep={1}
              yMin={0} yStep={20}
              xLabel="용량(Ah)" yLabel="빈도수(EA)"
            />
            <DistributionChart
              title="MF_Discharge 정규분포"
              data={mfdNormalData}
              xMin={34} xMax={42} xStep={1}
              yMin={0} yStep={0.02}
              xLabel="용량(Ah)" yLabel="확률밀도"
            />
            <DistributionChart
              title="MF Aging_OCV2 분포"
              data={ocv2DistData}
              xMin={2.5} xMax={2.7} xStep={0.02}
              yMin={0} yStep={10}
              xLabel="Voltage(V)" yLabel="빈도수(EA)"
              lsl={ocv2SpecVal}
            />
            <DistributionChart
              title="MF Aging_OCV2 정규분포"
              data={ocv2NormalData}
              xMin={2.5} xMax={2.7} xStep={0.02}
              yMin={0} yStep={0.02}
              xLabel="Voltage(V)" yLabel="확률밀도"
              lsl={ocv2SpecVal}
            />
          </div>
        </div>
      )}

      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpec}
        title="Main-Formation"
        specs={specs}
        specFields={SPEC_FIELDS}
      />
    </>
  );
}
