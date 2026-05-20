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
import Annotation from 'chartjs-plugin-annotation';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';
import SpecEditModal from '../common/SpecEditModal';
import {
  getLQCSpecs,
  saveLQCSpec,
  getLQCCoatingData,
  type SpecValue,
  type CoatingData,
} from '../../../../../api/quality/LQCService';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Annotation);

interface CoatingCathodeTableProps {
  projectId: number;
}

// 규격 필드 정의 (전극 두께는 TBD이므로 제외)
const COATING_SPEC_FIELDS = [
  { key: 'singleSideDensity', label: '단면 면적밀도', type: 'target-tolerance' as const, unit: 'mg/cm²' },
  { key: 'doubleSideDensity', label: '양면 면적밀도', type: 'target-tolerance' as const, unit: 'mg/cm²' },
  { key: 'coatingWidth', label: '코팅폭', type: 'target-tolerance' as const, unit: 'mm' },
  { key: 'uncoatedArea', label: '무지부', type: 'target-tolerance' as const, unit: 'mm' },
  { key: 'mismatch', label: 'Miss match', type: 'max-only' as const, unit: 'mm' },
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

export default function CoatingCathodeTable({ projectId }: CoatingCathodeTableProps) {
  // 규격 모달 상태
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  // 규격 데이터 상태
  const [coatingSpecs, setCoatingSpecs] = useState<Record<string, SpecValue>>({});

  // Coating 측정 데이터 상태
  const [coatingData, setCoatingData] = useState<CoatingData[]>([]);

  // API에서 규격 데이터 로드
  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specs = await getLQCSpecs(projectId, 'COATING_CATHODE');
        const coatingSpec = specs.find(s => s.itemType === 'COATING');
        if (coatingSpec) {
          setCoatingSpecs(coatingSpec.specs);
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
        const data = await getLQCCoatingData(projectId, 'C');
        setCoatingData(data);
      } catch (error) {
        console.error('Failed to load coating data:', error);
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
      await saveLQCSpec(projectId, 'COATING_CATHODE', 'COATING', specs);
      setCoatingSpecs(specs);
      setIsSpecModalOpen(false);
    } catch (error) {
      console.error('Failed to save spec:', error);
    }
  };

  // 데이터 존재 여부
  const hasData = coatingData.length > 0;

  // 각 행의 평균값 계산 (프론트에서 계산)
  const rowAvgValues = coatingData.map(d => ({
    singleSideAvg: calcRowAvg(d.singleSideTop, d.singleSideMiddle, d.singleSideBottom),
    doubleSideAvg: calcRowAvg(d.doubleSideTop, d.doubleSideMiddle, d.doubleSideBottom),
    thicknessAvg: calcRowAvg(d.thicknessTop, d.thicknessMiddle, d.thicknessBottom),
  }));

  // 통계 계산
  const stats = {
    // 단면 면적밀도 (평균은 프론트에서 계산)
    singleSideAvg: { avg: calcAvg(rowAvgValues.map(d => d.singleSideAvg)), max: calcMax(rowAvgValues.map(d => d.singleSideAvg)), min: calcMin(rowAvgValues.map(d => d.singleSideAvg)), stdev: calcStdev(rowAvgValues.map(d => d.singleSideAvg)) },
    singleSideTop: { avg: calcAvg(coatingData.map(d => d.singleSideTop)), max: calcMax(coatingData.map(d => d.singleSideTop)), min: calcMin(coatingData.map(d => d.singleSideTop)), stdev: calcStdev(coatingData.map(d => d.singleSideTop)) },
    singleSideMiddle: { avg: calcAvg(coatingData.map(d => d.singleSideMiddle)), max: calcMax(coatingData.map(d => d.singleSideMiddle)), min: calcMin(coatingData.map(d => d.singleSideMiddle)), stdev: calcStdev(coatingData.map(d => d.singleSideMiddle)) },
    singleSideBottom: { avg: calcAvg(coatingData.map(d => d.singleSideBottom)), max: calcMax(coatingData.map(d => d.singleSideBottom)), min: calcMin(coatingData.map(d => d.singleSideBottom)), stdev: calcStdev(coatingData.map(d => d.singleSideBottom)) },
    // 양면 면적밀도 (평균은 프론트에서 계산)
    doubleSideAvg: { avg: calcAvg(rowAvgValues.map(d => d.doubleSideAvg)), max: calcMax(rowAvgValues.map(d => d.doubleSideAvg)), min: calcMin(rowAvgValues.map(d => d.doubleSideAvg)), stdev: calcStdev(rowAvgValues.map(d => d.doubleSideAvg)) },
    doubleSideTop: { avg: calcAvg(coatingData.map(d => d.doubleSideTop)), max: calcMax(coatingData.map(d => d.doubleSideTop)), min: calcMin(coatingData.map(d => d.doubleSideTop)), stdev: calcStdev(coatingData.map(d => d.doubleSideTop)) },
    doubleSideMiddle: { avg: calcAvg(coatingData.map(d => d.doubleSideMiddle)), max: calcMax(coatingData.map(d => d.doubleSideMiddle)), min: calcMin(coatingData.map(d => d.doubleSideMiddle)), stdev: calcStdev(coatingData.map(d => d.doubleSideMiddle)) },
    doubleSideBottom: { avg: calcAvg(coatingData.map(d => d.doubleSideBottom)), max: calcMax(coatingData.map(d => d.doubleSideBottom)), min: calcMin(coatingData.map(d => d.doubleSideBottom)), stdev: calcStdev(coatingData.map(d => d.doubleSideBottom)) },
    // 전극 치수
    coatingWidth: { avg: calcAvg(coatingData.map(d => d.coatingWidth)), max: calcMax(coatingData.map(d => d.coatingWidth)), min: calcMin(coatingData.map(d => d.coatingWidth)), stdev: calcStdev(coatingData.map(d => d.coatingWidth)) },
    uncoatedArea: { avg: calcAvg(coatingData.map(d => d.uncoatedArea)), max: calcMax(coatingData.map(d => d.uncoatedArea)), min: calcMin(coatingData.map(d => d.uncoatedArea)), stdev: calcStdev(coatingData.map(d => d.uncoatedArea)) },
    mismatch: { avg: calcAvg(coatingData.map(d => d.mismatch)), max: calcMax(coatingData.map(d => d.mismatch)), min: calcMin(coatingData.map(d => d.mismatch)), stdev: calcStdev(coatingData.map(d => d.mismatch)) },
    // 전극 두께 (평균은 프론트에서 계산)
    thicknessAvg: { avg: calcAvg(rowAvgValues.map(d => d.thicknessAvg)), max: calcMax(rowAvgValues.map(d => d.thicknessAvg)), min: calcMin(rowAvgValues.map(d => d.thicknessAvg)), stdev: calcStdev(rowAvgValues.map(d => d.thicknessAvg)) },
    thicknessTop: { avg: calcAvg(coatingData.map(d => d.thicknessTop)), max: calcMax(coatingData.map(d => d.thicknessTop)), min: calcMin(coatingData.map(d => d.thicknessTop)), stdev: calcStdev(coatingData.map(d => d.thicknessTop)) },
    thicknessMiddle: { avg: calcAvg(coatingData.map(d => d.thicknessMiddle)), max: calcMax(coatingData.map(d => d.thicknessMiddle)), min: calcMin(coatingData.map(d => d.thicknessMiddle)), stdev: calcStdev(coatingData.map(d => d.thicknessMiddle)) },
    thicknessBottom: { avg: calcAvg(coatingData.map(d => d.thicknessBottom)), max: calcMax(coatingData.map(d => d.thicknessBottom)), min: calcMin(coatingData.map(d => d.thicknessBottom)), stdev: calcStdev(coatingData.map(d => d.thicknessBottom)) },
  };

  // 차트용 라벨 (Lot 번호)
  const chartLabels = coatingData.map(d => d.lot);

  // 양면 차트 X축 범위 계산
  const getDoubleSideChartRange = () => {
    const spec = coatingSpecs.doubleSideDensity;
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

  // 단면 차트 X축 범위 계산
  const getSingleSideChartRange = () => {
    const spec = coatingSpecs.singleSideDensity;
    if (spec?.target !== undefined && spec?.tolerance !== undefined) {
      return { min: spec.target - spec.tolerance, max: spec.target + spec.tolerance };
    }
    // 규격 없으면 데이터 기준
    const values = rowAvgValues.map(d => d.singleSideAvg).filter((v): v is number => v !== null);
    if (values.length > 0) {
      const dataMin = Math.min(...values);
      const dataMax = Math.max(...values);
      const padding = (dataMax - dataMin) * 0.1 || 0.25;
      return { min: dataMin - padding, max: dataMax + padding };
    }
    return { min: 0, max: 15 };
  };

  const doubleSideRange = getDoubleSideChartRange();
  const singleSideRange = getSingleSideChartRange();

  // 양면 차트 데이터 (평균값)
  const doubleSideChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: '양면 면적밀도',
        data: rowAvgValues.map(d => d.doubleSideAvg ?? 0),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        borderWidth: 1,
      },
    ],
  };

  // 단면 차트 데이터 (평균값)
  const singleSideChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: '단면 면적밀도',
        data: rowAvgValues.map(d => d.singleSideAvg ?? 0),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        borderWidth: 1,
      },
    ],
  };

  const doubleSideSpec = coatingSpecs.doubleSideDensity;
  const singleSideSpec = coatingSpecs.singleSideDensity;

  const calcTickStep = (tolerance: number | undefined) => {
    if (!tolerance) return undefined;
    if (tolerance <= 0.1) return 0.02;
    if (tolerance <= 0.3) return 0.05;
    if (tolerance <= 1) return 0.1;
    if (tolerance <= 3) return 0.5;
    return 1;
  };

  const makeSpecAnnotations = (spec: { target?: number; tolerance?: number } | undefined) => {
    if (spec?.target === undefined || spec?.tolerance === undefined) return {};
    const usl = spec.target + spec.tolerance;
    const lsl = spec.target - spec.tolerance;
    return {
      annotations: {
        uslLine: {
          type: 'line' as const,
          xMin: usl,
          xMax: usl,
          borderColor: '#dc2626',
          borderWidth: 2,
        },
        lslLine: {
          type: 'line' as const,
          xMin: lsl,
          xMax: lsl,
          borderColor: '#dc2626',
          borderWidth: 2,
        },
        targetLine: {
          type: 'line' as const,
          xMin: spec.target,
          xMax: spec.target,
          borderColor: '#16a34a',
          borderWidth: 2,
          borderDash: [4, 4],
        },
      },
    };
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
        text: '양극 코팅 결과 (양면)',
      },
      annotation: makeSpecAnnotations(doubleSideSpec),
    },
    scales: {
      x: {
        min: doubleSideRange.min,
        max: doubleSideRange.max,
        title: {
          display: true,
          text: 'Loading(mg/cm²)',
        },
        ticks: {
          stepSize: calcTickStep(doubleSideSpec?.tolerance),
          callback: (value: number | string) => Number(value).toFixed(2),
        },
      },
    },
  };

  // 단면 차트 옵션
  const singleSideChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '양극 코팅 결과 (단면)',
      },
      annotation: makeSpecAnnotations(singleSideSpec),
    },
    scales: {
      x: {
        min: singleSideRange.min,
        max: singleSideRange.max,
        title: {
          display: true,
          text: 'Loading(mg/cm²)',
        },
        ticks: {
          stepSize: calcTickStep(singleSideSpec?.tolerance),
          callback: (value: number | string) => Number(value).toFixed(2),
        },
      },
    },
  };

  return (
    <div className={styles.tableContainer}>
      {/* Coating 전극 검사 테이블 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>Coating 전극 검사 (양극)</h3>
          <button className={styles.specButton} onClick={openSpecModal}>
            규격 설정
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.lqcTable}>
            <thead>
              {/* 1행: 대분류 헤더 */}
              <tr>
                <th rowSpan={2}>No.</th>
                <th rowSpan={2}>Lot no.</th>
                <th rowSpan={2}>구분</th>
                <th colSpan={4} className={styles.groupBorder}>단면(A) 면적밀도(mg/cm²)</th>
                <th colSpan={4} className={styles.groupBorder}>양면(A+B) 면적밀도(mg/cm²)</th>
                <th colSpan={3} className={styles.groupBorder}>전극 치수 검사 (mm)</th>
                <th colSpan={4} className={styles.groupBorder}>전극 두께 검사 (㎛)</th>
              </tr>
              {/* 2행: 소분류 헤더 */}
              <tr>
                <th className={styles.groupBorder}>평균</th>
                <th>상단</th>
                <th>중단</th>
                <th>하단</th>
                <th className={styles.groupBorder}>평균</th>
                <th>상단</th>
                <th>중단</th>
                <th>하단</th>
                <th className={styles.groupBorder}>코팅폭</th>
                <th>무지부</th>
                <th>Miss match</th>
                <th className={styles.groupBorder}>평균</th>
                <th>상단</th>
                <th>중단</th>
                <th>하단</th>
              </tr>
            </thead>
            <tbody>
              {/* 규격 행 */}
              <tr className={styles.specRow}>
                <td colSpan={3}>규격</td>
                <td colSpan={4} className={styles.groupBorder}>{formatSpec(coatingSpecs.singleSideDensity, 'target-tolerance')}</td>
                <td colSpan={4} className={styles.groupBorder}>{formatSpec(coatingSpecs.doubleSideDensity, 'target-tolerance')}</td>
                <td className={styles.groupBorder}>{formatSpec(coatingSpecs.coatingWidth, 'target-tolerance')}</td>
                <td>{formatSpec(coatingSpecs.uncoatedArea, 'target-tolerance')}</td>
                <td>{formatSpec(coatingSpecs.mismatch, 'max-only')}</td>
                <td colSpan={4} className={styles.groupBorder}>TBD</td>
              </tr>
              {/* 평균 행 */}
              <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                <td colSpan={3}>Ave.</td>
                <td className={styles.groupBorder}>{formatNumber(stats.singleSideAvg.avg)}</td>
                <td>{formatNumber(stats.singleSideTop.avg)}</td>
                <td>{formatNumber(stats.singleSideMiddle.avg)}</td>
                <td>{formatNumber(stats.singleSideBottom.avg)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.doubleSideAvg.avg)}</td>
                <td>{formatNumber(stats.doubleSideTop.avg)}</td>
                <td>{formatNumber(stats.doubleSideMiddle.avg)}</td>
                <td>{formatNumber(stats.doubleSideBottom.avg)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.coatingWidth.avg, 1)}</td>
                <td>{formatNumber(stats.uncoatedArea.avg, 1)}</td>
                <td>{formatNumber(stats.mismatch.avg, 1)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.thicknessAvg.avg, 0)}</td>
                <td>{formatNumber(stats.thicknessTop.avg, 0)}</td>
                <td>{formatNumber(stats.thicknessMiddle.avg, 0)}</td>
                <td>{formatNumber(stats.thicknessBottom.avg, 0)}</td>
              </tr>
              {/* 최대값 행 */}
              <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                <td colSpan={3}>Max.</td>
                <td className={styles.groupBorder}>{formatNumber(stats.singleSideAvg.max)}</td>
                <td>{formatNumber(stats.singleSideTop.max)}</td>
                <td>{formatNumber(stats.singleSideMiddle.max)}</td>
                <td>{formatNumber(stats.singleSideBottom.max)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.doubleSideAvg.max)}</td>
                <td>{formatNumber(stats.doubleSideTop.max)}</td>
                <td>{formatNumber(stats.doubleSideMiddle.max)}</td>
                <td>{formatNumber(stats.doubleSideBottom.max)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.coatingWidth.max, 1)}</td>
                <td>{formatNumber(stats.uncoatedArea.max, 1)}</td>
                <td>{formatNumber(stats.mismatch.max, 1)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.thicknessAvg.max, 0)}</td>
                <td>{formatNumber(stats.thicknessTop.max, 0)}</td>
                <td>{formatNumber(stats.thicknessMiddle.max, 0)}</td>
                <td>{formatNumber(stats.thicknessBottom.max, 0)}</td>
              </tr>
              {/* 최소값 행 */}
              <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                <td colSpan={3}>Min.</td>
                <td className={styles.groupBorder}>{formatNumber(stats.singleSideAvg.min)}</td>
                <td>{formatNumber(stats.singleSideTop.min)}</td>
                <td>{formatNumber(stats.singleSideMiddle.min)}</td>
                <td>{formatNumber(stats.singleSideBottom.min)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.doubleSideAvg.min)}</td>
                <td>{formatNumber(stats.doubleSideTop.min)}</td>
                <td>{formatNumber(stats.doubleSideMiddle.min)}</td>
                <td>{formatNumber(stats.doubleSideBottom.min)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.coatingWidth.min, 1)}</td>
                <td>{formatNumber(stats.uncoatedArea.min, 1)}</td>
                <td>{formatNumber(stats.mismatch.min, 1)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.thicknessAvg.min, 0)}</td>
                <td>{formatNumber(stats.thicknessTop.min, 0)}</td>
                <td>{formatNumber(stats.thicknessMiddle.min, 0)}</td>
                <td>{formatNumber(stats.thicknessBottom.min, 0)}</td>
              </tr>
              {/* 표준편차 행 */}
              <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                <td colSpan={3}>Stdev.</td>
                <td className={styles.groupBorder}>{formatNumber(stats.singleSideAvg.stdev, 3)}</td>
                <td>{formatNumber(stats.singleSideTop.stdev, 3)}</td>
                <td>{formatNumber(stats.singleSideMiddle.stdev, 3)}</td>
                <td>{formatNumber(stats.singleSideBottom.stdev, 3)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.doubleSideAvg.stdev, 3)}</td>
                <td>{formatNumber(stats.doubleSideTop.stdev, 3)}</td>
                <td>{formatNumber(stats.doubleSideMiddle.stdev, 3)}</td>
                <td>{formatNumber(stats.doubleSideBottom.stdev, 3)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.coatingWidth.stdev, 3)}</td>
                <td>{formatNumber(stats.uncoatedArea.stdev, 3)}</td>
                <td>{formatNumber(stats.mismatch.stdev, 3)}</td>
                <td className={styles.groupBorder}>{formatNumber(stats.thicknessAvg.stdev, 3)}</td>
                <td>{formatNumber(stats.thicknessTop.stdev, 3)}</td>
                <td>{formatNumber(stats.thicknessMiddle.stdev, 3)}</td>
                <td>{formatNumber(stats.thicknessBottom.stdev, 3)}</td>
              </tr>
              {/* 데이터 행 */}
              {hasData ? (
                coatingData.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{row.lot}</td>
                    <td>{row.division}</td>
                    <td className={styles.groupBorder}>{formatNumber(calcRowAvg(row.singleSideTop, row.singleSideMiddle, row.singleSideBottom))}</td>
                    <td>{formatNumber(row.singleSideTop)}</td>
                    <td>{formatNumber(row.singleSideMiddle)}</td>
                    <td>{formatNumber(row.singleSideBottom)}</td>
                    <td className={styles.groupBorder}>{formatNumber(calcRowAvg(row.doubleSideTop, row.doubleSideMiddle, row.doubleSideBottom))}</td>
                    <td>{formatNumber(row.doubleSideTop)}</td>
                    <td>{formatNumber(row.doubleSideMiddle)}</td>
                    <td>{formatNumber(row.doubleSideBottom)}</td>
                    <td className={styles.groupBorder}>{formatNumber(row.coatingWidth, 1)}</td>
                    <td>{formatNumber(row.uncoatedArea, 1)}</td>
                    <td>{formatNumber(row.mismatch, 1)}</td>
                    <td className={styles.groupBorder}>{formatNumber(calcRowAvg(row.thicknessTop, row.thicknessMiddle, row.thicknessBottom), 0)}</td>
                    <td>{formatNumber(row.thicknessTop, 0)}</td>
                    <td>{formatNumber(row.thicknessMiddle, 0)}</td>
                    <td>{formatNumber(row.thicknessBottom, 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={18} className={styles.noDataRow}>
                    데이터 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 면적밀도 차트 */}
      {hasData && (
        <div className={styles.tableSection}>
          <h3 className={styles.tableTitle}>면적밀도 차트</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
            <div style={{ flex: 1, height: '250px' }}>
              <Bar data={doubleSideChartData} options={doubleSideChartOptions} />
            </div>
            <div style={{ flex: 1, height: '250px' }}>
              <Bar data={singleSideChartData} options={singleSideChartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* 규격 설정 모달 */}
      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpec}
        title="Coating"
        specFields={COATING_SPEC_FIELDS}
        specs={coatingSpecs}
      />
    </div>
  );
}
