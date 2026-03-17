import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';
import SpecEditModal from '../common/SpecEditModal';
import {
  getLQCSpecs,
  saveLQCSpec,
  getLQCPressData,
  type SpecValue,
  type PressData,
} from '../../../../../api/quality/LQCService';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PressAnodeTableProps {
  projectId: number;
}

// 규격 필드 정의
const PRESS_SPEC_FIELDS = [
  { key: 'doubleSideDensity', label: '양면 면적밀도', type: 'target-tolerance' as const, unit: 'mg/cm²' },
  { key: 'thickness', label: '전극 두께', type: 'target-tolerance' as const, unit: '㎛' },
];

// 규격 표시 헬퍼 함수
const formatSpec = (spec: SpecValue | undefined, type: string): string => {
  if (!spec) return '미설정';

  switch (type) {
    case 'target-tolerance':
      if (spec.target !== undefined && spec.tolerance !== undefined) {
        return `${spec.target.toLocaleString()}±${spec.tolerance.toLocaleString()}`;
      }
      return '미설정';
    case 'max-only':
      if (spec.max !== undefined) {
        return `≤${spec.max}`;
      }
      return '미설정';
    default:
      return '미설정';
  }
};

// 숫자 포맷팅 헬퍼
const formatNumber = (value: number | string | null, decimals: number = 2): string => {
  if (value === null || value === undefined || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return num.toFixed(decimals);
};

// 상단/중단/하단 평균 계산 (행 단위)
const calcRowAvg = (top: number | string | null, middle: number | string | null, bottom: number | string | null): number | null => {
  const toNum = (v: number | string | null): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return isNaN(num) ? null : num;
  };
  const values = [toNum(top), toNum(middle), toNum(bottom)].filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

// 문자열/숫자를 숫자로 변환
const toNumber = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const num = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(num) ? null : num;
};

// 통계 계산 헬퍼 함수들
const calcAvg = (values: (number | string | null)[]): number | null => {
  const validValues = values.map(toNumber).filter((v): v is number => v !== null);
  if (validValues.length === 0) return null;
  return validValues.reduce((a, b) => a + b, 0) / validValues.length;
};

const calcMax = (values: (number | string | null)[]): number | null => {
  const validValues = values.map(toNumber).filter((v): v is number => v !== null);
  if (validValues.length === 0) return null;
  return Math.max(...validValues);
};

const calcMin = (values: (number | string | null)[]): number | null => {
  const validValues = values.map(toNumber).filter((v): v is number => v !== null);
  if (validValues.length === 0) return null;
  return Math.min(...validValues);
};

const calcStdev = (values: (number | string | null)[]): number | null => {
  const validValues = values.map(toNumber).filter((v): v is number => v !== null);
  if (validValues.length < 2) return null;
  const avg = validValues.reduce((a, b) => a + b, 0) / validValues.length;
  const squaredDiffs = validValues.map(v => Math.pow(v - avg, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / validValues.length;
  return Math.sqrt(avgSquaredDiff);
};

export default function PressAnodeTable({ projectId }: PressAnodeTableProps) {
  // 규격 모달 상태
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  // 규격 데이터 상태
  const [pressSpecs, setPressSpecs] = useState<Record<string, SpecValue>>({});

  // Press 측정 데이터 상태
  const [pressData, setPressData] = useState<PressData[]>([]);

  // API에서 규격 데이터 로드
  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specs = await getLQCSpecs(projectId, 'PRESS_ANODE');
        const pressSpec = specs.find(s => s.itemType === 'PRESS');
        if (pressSpec) {
          setPressSpecs(pressSpec.specs);
        }
      } catch (error) {
        console.error('Failed to load specs:', error);
      }
    };
    loadSpecs();
  }, [projectId]);

  // API에서 측정 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getLQCPressData(projectId, 'A');
        setPressData(data);
      } catch (error) {
        console.error('Failed to load press data:', error);
      }
    };
    loadData();
  }, [projectId]);

  // 규격 편집 모달 열기
  const openSpecModal = () => {
    setIsSpecModalOpen(true);
  };

  // 규격 저장 핸들러
  const handleSaveSpec = async (specs: Record<string, SpecValue>) => {
    try {
      await saveLQCSpec(projectId, 'PRESS_ANODE', 'PRESS', specs);
      setPressSpecs(specs);
      setIsSpecModalOpen(false);
    } catch (error) {
      console.error('Failed to save spec:', error);
    }
  };

  // 데이터 존재 여부
  const hasData = pressData.length > 0;

  // 각 행의 평균값 계산 (프론트에서 계산)
  const rowAvgValues = pressData.map(d => ({
    doubleSideAvg: calcRowAvg(d.doubleSideTop, d.doubleSideMiddle, d.doubleSideBottom),
    thicknessAvg: calcRowAvg(d.thicknessTop, d.thicknessMiddle, d.thicknessBottom),
  }));

  // 통계 계산
  const stats = {
    // 양면 면적밀도 (평균은 프론트에서 계산)
    doubleSideAvg: { avg: calcAvg(rowAvgValues.map(d => d.doubleSideAvg)), max: calcMax(rowAvgValues.map(d => d.doubleSideAvg)), min: calcMin(rowAvgValues.map(d => d.doubleSideAvg)), stdev: calcStdev(rowAvgValues.map(d => d.doubleSideAvg)) },
    doubleSideTop: { avg: calcAvg(pressData.map(d => d.doubleSideTop)), max: calcMax(pressData.map(d => d.doubleSideTop)), min: calcMin(pressData.map(d => d.doubleSideTop)), stdev: calcStdev(pressData.map(d => d.doubleSideTop)) },
    doubleSideMiddle: { avg: calcAvg(pressData.map(d => d.doubleSideMiddle)), max: calcMax(pressData.map(d => d.doubleSideMiddle)), min: calcMin(pressData.map(d => d.doubleSideMiddle)), stdev: calcStdev(pressData.map(d => d.doubleSideMiddle)) },
    doubleSideBottom: { avg: calcAvg(pressData.map(d => d.doubleSideBottom)), max: calcMax(pressData.map(d => d.doubleSideBottom)), min: calcMin(pressData.map(d => d.doubleSideBottom)), stdev: calcStdev(pressData.map(d => d.doubleSideBottom)) },
    // 전극 두께 (평균은 프론트에서 계산)
    thicknessAvg: { avg: calcAvg(rowAvgValues.map(d => d.thicknessAvg)), max: calcMax(rowAvgValues.map(d => d.thicknessAvg)), min: calcMin(rowAvgValues.map(d => d.thicknessAvg)), stdev: calcStdev(rowAvgValues.map(d => d.thicknessAvg)) },
    thicknessTop: { avg: calcAvg(pressData.map(d => d.thicknessTop)), max: calcMax(pressData.map(d => d.thicknessTop)), min: calcMin(pressData.map(d => d.thicknessTop)), stdev: calcStdev(pressData.map(d => d.thicknessTop)) },
    thicknessMiddle: { avg: calcAvg(pressData.map(d => d.thicknessMiddle)), max: calcMax(pressData.map(d => d.thicknessMiddle)), min: calcMin(pressData.map(d => d.thicknessMiddle)), stdev: calcStdev(pressData.map(d => d.thicknessMiddle)) },
    thicknessBottom: { avg: calcAvg(pressData.map(d => d.thicknessBottom)), max: calcMax(pressData.map(d => d.thicknessBottom)), min: calcMin(pressData.map(d => d.thicknessBottom)), stdev: calcStdev(pressData.map(d => d.thicknessBottom)) },
  };

  // 차트용 라벨 (Lot 번호)
  const chartLabels = pressData.map(d => d.lot);

  // 양면 차트 X축 범위 계산
  const getDoubleSideChartRange = () => {
    const spec = pressSpecs.doubleSideDensity;
    if (spec?.target !== undefined && spec?.tolerance !== undefined) {
      return { min: spec.target - spec.tolerance, max: spec.target + spec.tolerance };
    }
    // 규격 없으면 데이터 기준
    const values = rowAvgValues.map(d => d.doubleSideAvg).filter((v): v is number => v !== null);
    if (values.length > 0) {
      const dataMin = Math.min(...values);
      const dataMax = Math.max(...values);
      const padding = (dataMax - dataMin) * 0.1 || 0.5;
      return { min: dataMin - padding, max: dataMax + padding };
    }
    return { min: 0, max: 30 };
  };

  // 두께 차트 X축 범위 계산
  const getThicknessChartRange = () => {
    const spec = pressSpecs.thickness;
    if (spec?.target !== undefined && spec?.tolerance !== undefined) {
      return { min: spec.target - spec.tolerance, max: spec.target + spec.tolerance };
    }
    // 규격 없으면 데이터 기준
    const values = rowAvgValues.map(d => d.thicknessAvg).filter((v): v is number => v !== null);
    if (values.length > 0) {
      const dataMin = Math.min(...values);
      const dataMax = Math.max(...values);
      const padding = (dataMax - dataMin) * 0.1 || 1;
      return { min: dataMin - padding, max: dataMax + padding };
    }
    return { min: 80, max: 100 };
  };

  const doubleSideRange = getDoubleSideChartRange();
  const thicknessRange = getThicknessChartRange();

  // 두께 차트 데이터 (평균값)
  const thicknessChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: '전극 두께',
        data: rowAvgValues.map(d => d.thicknessAvg ?? 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };

  // 양면 차트 데이터 (평균값)
  const doubleSideChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: '양면 면적밀도',
        data: rowAvgValues.map(d => d.doubleSideAvg ?? 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };

  // 두께 차트 옵션
  const thicknessChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '음극 압연 결과 (두께)',
      },
    },
    scales: {
      x: {
        min: thicknessRange.min,
        max: thicknessRange.max,
        title: {
          display: true,
          text: 'Thickness(㎛)',
        },
      },
    },
  };

  // 양면 차트 옵션
  const doubleSideChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '음극 압연 결과 (Loading)',
      },
    },
    scales: {
      x: {
        min: doubleSideRange.min,
        max: doubleSideRange.max,
        title: {
          display: true,
          text: 'Loading(mg/㎠)',
        },
      },
    },
  };

  return (
    <div className={styles.tableContainer}>
      {/* Press 전극 검사 - 테이블과 차트 좌우 배치 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>Press 전극 검사 (음극)</h3>
          <button className={styles.specButton} onClick={openSpecModal}>
            규격 설정
          </button>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* 테이블 */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table className={styles.lqcTable}>
              <thead>
                {/* 1행: 대분류 헤더 */}
                <tr>
                  <th rowSpan={2}>No.</th>
                  <th rowSpan={2}>Lot no.</th>
                  <th rowSpan={2}>구분</th>
                  <th colSpan={4}>양면(A+B) 면적밀도(mg/㎠)</th>
                  <th colSpan={4}>전극 두께 검사 (㎛)</th>
                </tr>
                {/* 2행: 소분류 헤더 */}
                <tr>
                  <th>평균</th>
                  <th>상단</th>
                  <th>중단</th>
                  <th>하단</th>
                  <th>평균</th>
                  <th>상단</th>
                  <th>중단</th>
                  <th>하단</th>
                </tr>
              </thead>
              <tbody>
                {/* 규격 행 */}
                <tr className={styles.specRow}>
                  <td colSpan={3}>규격</td>
                  <td colSpan={4}>{formatSpec(pressSpecs.doubleSideDensity, 'target-tolerance')}</td>
                  <td colSpan={4}>{formatSpec(pressSpecs.thickness, 'target-tolerance')}</td>
                </tr>
                {/* 평균 행 */}
                <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                  <td colSpan={3}>Ave.</td>
                  <td>{formatNumber(stats.doubleSideAvg.avg)}</td>
                  <td>{formatNumber(stats.doubleSideTop.avg)}</td>
                  <td>{formatNumber(stats.doubleSideMiddle.avg)}</td>
                  <td>{formatNumber(stats.doubleSideBottom.avg)}</td>
                  <td>{formatNumber(stats.thicknessAvg.avg, 0)}</td>
                  <td>{formatNumber(stats.thicknessTop.avg, 0)}</td>
                  <td>{formatNumber(stats.thicknessMiddle.avg, 0)}</td>
                  <td>{formatNumber(stats.thicknessBottom.avg, 0)}</td>
                </tr>
                {/* 최대값 행 */}
                <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                  <td colSpan={3}>Max.</td>
                  <td>{formatNumber(stats.doubleSideAvg.max)}</td>
                  <td>{formatNumber(stats.doubleSideTop.max)}</td>
                  <td>{formatNumber(stats.doubleSideMiddle.max)}</td>
                  <td>{formatNumber(stats.doubleSideBottom.max)}</td>
                  <td>{formatNumber(stats.thicknessAvg.max, 0)}</td>
                  <td>{formatNumber(stats.thicknessTop.max, 0)}</td>
                  <td>{formatNumber(stats.thicknessMiddle.max, 0)}</td>
                  <td>{formatNumber(stats.thicknessBottom.max, 0)}</td>
                </tr>
                {/* 최소값 행 */}
                <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                  <td colSpan={3}>Min.</td>
                  <td>{formatNumber(stats.doubleSideAvg.min)}</td>
                  <td>{formatNumber(stats.doubleSideTop.min)}</td>
                  <td>{formatNumber(stats.doubleSideMiddle.min)}</td>
                  <td>{formatNumber(stats.doubleSideBottom.min)}</td>
                  <td>{formatNumber(stats.thicknessAvg.min, 0)}</td>
                  <td>{formatNumber(stats.thicknessTop.min, 0)}</td>
                  <td>{formatNumber(stats.thicknessMiddle.min, 0)}</td>
                  <td>{formatNumber(stats.thicknessBottom.min, 0)}</td>
                </tr>
                {/* 표준편차 행 */}
                <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                  <td colSpan={3}>Stdev.</td>
                  <td>{formatNumber(stats.doubleSideAvg.stdev, 3)}</td>
                  <td>{formatNumber(stats.doubleSideTop.stdev, 3)}</td>
                  <td>{formatNumber(stats.doubleSideMiddle.stdev, 3)}</td>
                  <td>{formatNumber(stats.doubleSideBottom.stdev, 3)}</td>
                  <td>{formatNumber(stats.thicknessAvg.stdev, 3)}</td>
                  <td>{formatNumber(stats.thicknessTop.stdev, 3)}</td>
                  <td>{formatNumber(stats.thicknessMiddle.stdev, 3)}</td>
                  <td>{formatNumber(stats.thicknessBottom.stdev, 3)}</td>
                </tr>
                {/* 데이터 행 */}
                {hasData ? (
                  pressData.map((row, index) => (
                    <tr key={`${row.id}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.lot}</td>
                      <td>{row.division}</td>
                      <td>{formatNumber(calcRowAvg(row.doubleSideTop, row.doubleSideMiddle, row.doubleSideBottom))}</td>
                      <td>{formatNumber(row.doubleSideTop)}</td>
                      <td>{formatNumber(row.doubleSideMiddle)}</td>
                      <td>{formatNumber(row.doubleSideBottom)}</td>
                      <td>{formatNumber(calcRowAvg(row.thicknessTop, row.thicknessMiddle, row.thicknessBottom), 0)}</td>
                      <td>{formatNumber(row.thicknessTop, 0)}</td>
                      <td>{formatNumber(row.thicknessMiddle, 0)}</td>
                      <td>{formatNumber(row.thicknessBottom, 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className={styles.noDataRow}>
                      데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* 차트 */}
          <div style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ height: '200px' }}>
              {hasData ? (
                <Bar data={thicknessChartData} options={thicknessChartOptions} />
              ) : (
                <div className={styles.noDataChart}>데이터 없음</div>
              )}
            </div>
            <div style={{ height: '200px' }}>
              {hasData ? (
                <Bar data={doubleSideChartData} options={doubleSideChartOptions} />
              ) : (
                <div className={styles.noDataChart}>데이터 없음</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 규격 설정 모달 */}
      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpec}
        title="Press"
        specFields={PRESS_SPEC_FIELDS}
        specs={pressSpecs}
      />
    </div>
  );
}
