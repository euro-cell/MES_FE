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
  getLQCVDData,
  type SpecValue,
  type VDData,
} from '../../../../../api/quality/LQCService';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface VDCathodeTableProps {
  projectId: number;
}

// 규격 필드 정의
const VD_SPEC_FIELDS = [
  { key: 'moisture', label: '전극 수분함량', type: 'max-only' as const, unit: 'ppm' },
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

// 수분함량 평균 계산 (행 단위)
const calcRowAvg = (v1: number | string | null, v2: number | string | null, v3: number | string | null): number | null => {
  const toNum = (v: number | string | null): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return isNaN(num) ? null : num;
  };
  const values = [toNum(v1), toNum(v2), toNum(v3)].filter((v): v is number => v !== null);
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

export default function VDCathodeTable({ projectId }: VDCathodeTableProps) {
  // 규격 모달 상태
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  // 규격 데이터 상태
  const [vdSpecs, setVdSpecs] = useState<Record<string, SpecValue>>({});

  // VD 측정 데이터 상태
  const [vdData, setVdData] = useState<VDData[]>([]);

  // API에서 규격 데이터 로드
  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specs = await getLQCSpecs(projectId, 'VD_CATHODE');
        const vdSpec = specs.find(s => s.itemType === 'VD');
        if (vdSpec) {
          setVdSpecs(vdSpec.specs);
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
        const data = await getLQCVDData(projectId, 'C');
        setVdData(data);
      } catch (error) {
        console.error('Failed to load VD data:', error);
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
      await saveLQCSpec(projectId, 'VD_CATHODE', 'VD', specs);
      setVdSpecs(specs);
      setIsSpecModalOpen(false);
    } catch (error) {
      console.error('Failed to save spec:', error);
    }
  };

  // 데이터 존재 여부
  const hasData = vdData.length > 0;

  // 각 행의 평균값 계산 (프론트에서 계산)
  const rowAvgValues = vdData.map(d => ({
    moistureAvg: calcRowAvg(d.moisture1, d.moisture2, d.moisture3),
  }));

  // 통계 계산
  const stats = {
    moistureAvg: { avg: calcAvg(rowAvgValues.map(d => d.moistureAvg)), max: calcMax(rowAvgValues.map(d => d.moistureAvg)), min: calcMin(rowAvgValues.map(d => d.moistureAvg)), stdev: calcStdev(rowAvgValues.map(d => d.moistureAvg)) },
    moisture1: { avg: calcAvg(vdData.map(d => d.moisture1)), max: calcMax(vdData.map(d => d.moisture1)), min: calcMin(vdData.map(d => d.moisture1)), stdev: calcStdev(vdData.map(d => d.moisture1)) },
    moisture2: { avg: calcAvg(vdData.map(d => d.moisture2)), max: calcMax(vdData.map(d => d.moisture2)), min: calcMin(vdData.map(d => d.moisture2)), stdev: calcStdev(vdData.map(d => d.moisture2)) },
    moisture3: { avg: calcAvg(vdData.map(d => d.moisture3)), max: calcMax(vdData.map(d => d.moisture3)), min: calcMin(vdData.map(d => d.moisture3)), stdev: calcStdev(vdData.map(d => d.moisture3)) },
  };

  // 차트용 라벨 (작업일자)
  const chartLabels = vdData.map(d => d.workDate);

  // 차트 X축 범위 계산
  const getMoistureChartRange = () => {
    const spec = vdSpecs.moisture;
    if (spec?.max !== undefined) {
      return { min: 0, max: spec.max };
    }
    return { min: 0, max: 300 };
  };

  const moistureRange = getMoistureChartRange();

  // 수분함량 차트 데이터 (평균값)
  const moistureChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: '수분함량',
        data: rowAvgValues.map(d => d.moistureAvg ?? 0),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        borderWidth: 1,
      },
    ],
  };

  // 수분함량 차트 옵션
  const moistureChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '양극 VD 결과 (수분)',
      },
    },
    scales: {
      x: {
        min: moistureRange.min,
        max: moistureRange.max,
        title: {
          display: true,
          text: 'Moisture(ppm)',
        },
      },
    },
  };

  return (
    <div className={styles.tableContainer}>
      {/* VD 전극 검사 - 테이블과 차트 좌우 배치 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>VD 전극 검사 (양극)</h3>
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
                <th rowSpan={2}>작업일자</th>
                <th rowSpan={2}>구분</th>
                <th colSpan={4}>전극 수분함량 검사 (ppm)</th>
                <th colSpan={5}>전극 Lot no.</th>
              </tr>
              {/* 2행: 소분류 헤더 */}
              <tr>
                <th>평균</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
              </tr>
            </thead>
            <tbody>
              {/* 규격 행 */}
              <tr className={styles.specRow}>
                <td colSpan={3}>규격</td>
                <td colSpan={4}>{formatSpec(vdSpecs.moisture, 'max-only')}</td>
                <td colSpan={5}></td>
              </tr>
              {/* 평균 행 */}
              <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                <td colSpan={3}>Ave.</td>
                <td>{formatNumber(stats.moistureAvg.avg)}</td>
                <td>{formatNumber(stats.moisture1.avg)}</td>
                <td>{formatNumber(stats.moisture2.avg)}</td>
                <td>{formatNumber(stats.moisture3.avg)}</td>
                <td colSpan={5}></td>
              </tr>
              {/* 최대값 행 */}
              <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                <td colSpan={3}>Max.</td>
                <td>{formatNumber(stats.moistureAvg.max)}</td>
                <td>{formatNumber(stats.moisture1.max)}</td>
                <td>{formatNumber(stats.moisture2.max)}</td>
                <td>{formatNumber(stats.moisture3.max)}</td>
                <td colSpan={5}></td>
              </tr>
              {/* 최소값 행 */}
              <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                <td colSpan={3}>Min.</td>
                <td>{formatNumber(stats.moistureAvg.min)}</td>
                <td>{formatNumber(stats.moisture1.min)}</td>
                <td>{formatNumber(stats.moisture2.min)}</td>
                <td>{formatNumber(stats.moisture3.min)}</td>
                <td colSpan={5}></td>
              </tr>
              {/* 표준편차 행 */}
              <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                <td colSpan={3}>Stdev.</td>
                <td>{formatNumber(stats.moistureAvg.stdev, 3)}</td>
                <td>{formatNumber(stats.moisture1.stdev, 3)}</td>
                <td>{formatNumber(stats.moisture2.stdev, 3)}</td>
                <td>{formatNumber(stats.moisture3.stdev, 3)}</td>
                <td colSpan={5}></td>
              </tr>
              {/* 데이터 행 */}
              {hasData ? (
                vdData.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{row.workDate}</td>
                    <td>{row.division}</td>
                    <td>{formatNumber(calcRowAvg(row.moisture1, row.moisture2, row.moisture3))}</td>
                    <td>{formatNumber(row.moisture1)}</td>
                    <td>{formatNumber(row.moisture2)}</td>
                    <td>{formatNumber(row.moisture3)}</td>
                    <td>{row.lot1 || '-'}</td>
                    <td>{row.lot2 || '-'}</td>
                    <td>{row.lot3 || '-'}</td>
                    <td>{row.lot4 || '-'}</td>
                    <td>{row.lot5 || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className={styles.noDataRow}>
                    데이터 없음
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
          {/* 차트 */}
          <div style={{ flex: '0 0 350px', height: '300px' }}>
            {hasData ? (
              <Bar data={moistureChartData} options={moistureChartOptions} />
            ) : (
              <div className={styles.noDataChart}>데이터 없음</div>
            )}
          </div>
        </div>
      </div>

      {/* 규격 설정 모달 */}
      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpec}
        title="VD"
        specFields={VD_SPEC_FIELDS}
        specs={vdSpecs}
      />
    </div>
  );
}
