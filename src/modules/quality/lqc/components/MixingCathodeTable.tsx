import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';
import SpecEditModal from './SpecEditModal';
import { getLQCSpecs, type SpecValue } from '../LQCService';

interface MixingCathodeTableProps {
  projectId: number;
}

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

interface BinderRow {
  no: number;
  manufactureDate: string;
  lotNo: string;
  solidContent1: number | null;
  solidContent2: number | null;
  solidContent3: number | null;
  solidContentAvg: number | null;
  viscosity: number | null;
}

interface SlurryRow {
  no: number;
  manufactureDate: string;
  batchLot: string;
  solidContent1: number | null;
  solidContent2: number | null;
  solidContent3: number | null;
  solidContentAvg: number | null;
  viscosity: number | null;
  particleSize: number | null;
}

// 규격 필드 정의
const BINDER_SPEC_FIELDS = [
  { key: 'solidContent', label: '고형분', type: 'target-tolerance' as const, unit: '%' },
  { key: 'viscosity', label: '점도', type: 'target-tolerance' as const, unit: 'cps' },
];

const SLURRY_SPEC_FIELDS = [
  { key: 'solidContent', label: '고형분', type: 'target-tolerance' as const, unit: '%' },
  { key: 'viscosity', label: '점도', type: 'target-tolerance' as const, unit: 'cps' },
  { key: 'particleSize', label: '입도', type: 'max-only' as const, unit: '㎛' },
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
    case 'min-only':
      if (spec.min !== undefined) {
        return `≥${spec.min}`;
      }
      return '미설정';
    case 'range':
      if (spec.min !== undefined && spec.max !== undefined) {
        return `${spec.min} ~ ${spec.max}`;
      }
      return '미설정';
    default:
      return '미설정';
  }
};

export default function MixingCathodeTable({ projectId }: MixingCathodeTableProps) {
  // 규격 모달 상태
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [editingSpecType, setEditingSpecType] = useState<'binder' | 'slurry'>('binder');

  // 규격 데이터 상태
  const [binderSpecs, setBinderSpecs] = useState<Record<string, SpecValue>>({});
  const [slurrySpecs, setSlurrySpecs] = useState<Record<string, SpecValue>>({});

  // API에서 규격 데이터 로드
  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specs = await getLQCSpecs(projectId, 'MIXING_CATHODE');

        const binderSpec = specs.find(s => s.itemType === 'BINDER');
        const slurrySpec = specs.find(s => s.itemType === 'SLURRY');

        if (binderSpec) {
          setBinderSpecs(binderSpec.specs);
        }
        if (slurrySpec) {
          setSlurrySpecs(slurrySpec.specs);
        }
      } catch (err) {
        console.error('규격 데이터 로드 실패:', err);
      }
    };

    loadSpecs();
  }, [projectId]);

  const handleOpenSpecModal = (type: 'binder' | 'slurry') => {
    setEditingSpecType(type);
    setIsSpecModalOpen(true);
  };

  const handleSaveSpecs = (specs: Record<string, SpecValue>) => {
    if (editingSpecType === 'binder') {
      setBinderSpecs(specs);
    } else {
      setSlurrySpecs(specs);
    }
    // TODO: 저장 API 연결
  };

  // 임시 데이터 (나중에 API 연결)
  const binderData: BinderRow[] = [
    {
      no: 1,
      manufactureDate: '2025.12.01',
      lotNo: '',
      solidContent1: 5.6,
      solidContent2: 5.8,
      solidContent3: null,
      solidContentAvg: 5.7,
      viscosity: 3510,
    },
    { no: 2, manufactureDate: '', lotNo: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null },
    { no: 3, manufactureDate: '', lotNo: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null },
    { no: 4, manufactureDate: '', lotNo: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null },
    { no: 5, manufactureDate: '', lotNo: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null },
  ];

  const slurryData: SlurryRow[] = [
    {
      no: 1,
      manufactureDate: '2025.12.02',
      batchLot: 'DL02C11',
      solidContent1: 59.9,
      solidContent2: 59.8,
      solidContent3: 59.8,
      solidContentAvg: 59.8,
      viscosity: 7160,
      particleSize: 28,
    },
    { no: 2, manufactureDate: '', batchLot: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null, particleSize: null },
    { no: 3, manufactureDate: '', batchLot: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null, particleSize: null },
    { no: 4, manufactureDate: '', batchLot: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null, particleSize: null },
    { no: 5, manufactureDate: '', batchLot: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null, particleSize: null },
  ];

  // Binder 차트 데이터
  const binderChartData = {
    labels: binderData.map(row => row.no.toString()),
    datasets: [
      {
        type: 'bar' as const,
        label: '고형분',
        data: binderData.map(row => row.solidContentAvg),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
        order: 2,
      },
      {
        type: 'line' as const,
        label: '점도',
        data: binderData.map(row => row.viscosity),
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 1)',
        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
        pointBorderColor: 'rgba(255, 193, 7, 1)',
        pointRadius: 6,
        yAxisID: 'y',
        order: 1,
      },
    ],
  };

  // Slurry 차트 데이터
  const slurryChartData = {
    labels: slurryData.map(row => row.no.toString()),
    datasets: [
      {
        type: 'bar' as const,
        label: '고형분',
        data: slurryData.map(row => row.solidContentAvg),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
        order: 3,
      },
      {
        type: 'line' as const,
        label: '점도',
        data: slurryData.map(row => row.viscosity),
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 1)',
        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
        pointBorderColor: 'rgba(255, 193, 7, 1)',
        pointRadius: 6,
        yAxisID: 'y',
        order: 1,
      },
      {
        type: 'line' as const,
        label: '입도',
        data: slurryData.map(row => row.particleSize),
        borderColor: 'rgba(76, 175, 80, 1)',
        backgroundColor: 'rgba(76, 175, 80, 1)',
        pointBackgroundColor: 'rgba(76, 175, 80, 1)',
        pointBorderColor: 'rgba(76, 175, 80, 1)',
        pointStyle: 'triangle',
        pointRadius: 6,
        yAxisID: 'y1',
        order: 2,
      },
    ],
  };

  // Binder 차트 옵션
  const binderChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: '양극 바인더용액 제조 결과',
        font: { size: 14 },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: '점도(cps)',
        },
        min: 0,
        max: 4000,
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: '고형분(%)',
        },
        min: 0,
        max: 6,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Slurry 차트 옵션
  const slurryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: '양극 슬러리 제조 결과',
        font: { size: 14 },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: '점도(cps)',
        },
        min: 0,
        max: 8000,
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: '고형분(%)/입도(㎛)',
        },
        min: 0,
        max: 70,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className={styles.tableContainer}>
      {/* Binder Solution Mixing 검사 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>Binder Solution Mixing 검사 (양극)</h3>
          <button className={styles.specButton} onClick={() => handleOpenSpecModal('binder')}>
            규격 설정
          </button>
        </div>
        <div className={styles.tableChartWrapper}>
          <div className={styles.tableWrapper}>
            <table className={styles.lqcTable}>
              <thead>
                <tr>
                  <th rowSpan={2}>No.</th>
                  <th rowSpan={2}>제조일자</th>
                  <th rowSpan={2}>Lot no.</th>
                  <th colSpan={4}>고형분(%)</th>
                  <th rowSpan={2}>점도(cps)</th>
                </tr>
                <tr>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>평균</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.specRow}>
                  <td colSpan={3}>규격</td>
                  <td colSpan={4}>{formatSpec(binderSpecs.solidContent, 'target-tolerance')}</td>
                  <td>{formatSpec(binderSpecs.viscosity, 'target-tolerance')}</td>
                </tr>
                {binderData.map(row => (
                  <tr key={row.no}>
                    <td>{row.no}</td>
                    <td>{row.manufactureDate}</td>
                    <td>{row.lotNo}</td>
                    <td>{row.solidContent1 ?? ''}</td>
                    <td>{row.solidContent2 ?? ''}</td>
                    <td>{row.solidContent3 ?? ''}</td>
                    <td>{row.solidContentAvg ?? ''}</td>
                    <td>{row.viscosity?.toLocaleString() ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.chartWrapper}>
            <Bar data={binderChartData as any} options={binderChartOptions} />
          </div>
        </div>
      </div>

      {/* Slurry Mixing 검사 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>Slurry Mixing 검사 (양극)</h3>
          <button className={styles.specButton} onClick={() => handleOpenSpecModal('slurry')}>
            규격 설정
          </button>
        </div>
        <div className={styles.tableChartWrapper}>
          <div className={styles.tableWrapper}>
            <table className={styles.lqcTable}>
              <thead>
                <tr>
                  <th rowSpan={2}>No.</th>
                  <th rowSpan={2}>제조일자</th>
                  <th rowSpan={2}>Batch Lot.</th>
                  <th colSpan={4}>고형분(%)</th>
                  <th rowSpan={2}>점도(cps)</th>
                  <th rowSpan={2}>입도(㎛)</th>
                </tr>
                <tr>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>평균</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.specRow}>
                  <td colSpan={3}>규격</td>
                  <td colSpan={4}>{formatSpec(slurrySpecs.solidContent, 'target-tolerance')}</td>
                  <td>{formatSpec(slurrySpecs.viscosity, 'target-tolerance')}</td>
                  <td>{formatSpec(slurrySpecs.particleSize, 'max-only')}</td>
                </tr>
                {slurryData.map(row => (
                  <tr key={row.no}>
                    <td>{row.no}</td>
                    <td>{row.manufactureDate}</td>
                    <td>{row.batchLot}</td>
                    <td>{row.solidContent1 ?? ''}</td>
                    <td>{row.solidContent2 ?? ''}</td>
                    <td>{row.solidContent3 ?? ''}</td>
                    <td>{row.solidContentAvg ?? ''}</td>
                    <td>{row.viscosity?.toLocaleString() ?? ''}</td>
                    <td>{row.particleSize ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.chartWrapper}>
            <Bar data={slurryChartData as any} options={slurryChartOptions} />
          </div>
        </div>
      </div>

      {/* 규격 설정 모달 */}
      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpecs}
        title={editingSpecType === 'binder' ? 'Binder Solution Mixing' : 'Slurry Mixing'}
        specs={editingSpecType === 'binder' ? binderSpecs : slurrySpecs}
        specFields={editingSpecType === 'binder' ? BINDER_SPEC_FIELDS : SLURRY_SPEC_FIELDS}
      />
    </div>
  );
}
