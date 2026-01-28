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
import {
  getLQCSpecs,
  saveLQCSpec,
  getLQCBinderData,
  getLQCSlurryData,
  type SpecValue,
  type BinderData,
  type SlurryData,
} from '../../../../api/quality/LQCService';

interface MixingCathodeTableProps {
  projectId: number;
}

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// 고형분 평균 계산 헬퍼 함수
const calcSolidContentAvg = (s1: string, s2: string, s3: string): number | null => {
  const values = [s1, s2, s3].map(v => parseFloat(v)).filter(v => !isNaN(v));
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

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

  // Binder 측정 데이터 상태
  const [binderData, setBinderData] = useState<BinderData[]>([]);

  // Slurry 측정 데이터 상태
  const [slurryData, setSlurryData] = useState<SlurryData[]>([]);

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

  // API에서 Binder 데이터 로드
  useEffect(() => {
    const loadBinderData = async () => {
      try {
        const data = await getLQCBinderData(projectId, 'C'); // 양극(Cathode)
        setBinderData(data);
      } catch (err) {
        console.error('Binder 데이터 로드 실패:', err);
      }
    };

    loadBinderData();
  }, [projectId]);

  const handleOpenSpecModal = (type: 'binder' | 'slurry') => {
    setEditingSpecType(type);
    setIsSpecModalOpen(true);
  };

  const handleSaveSpecs = async (specs: Record<string, SpecValue>) => {
    const itemType = editingSpecType === 'binder' ? 'BINDER' : 'SLURRY';

    try {
      await saveLQCSpec(projectId, 'MIXING_CATHODE', itemType, specs);

      if (editingSpecType === 'binder') {
        setBinderSpecs(specs);
      } else {
        setSlurrySpecs(specs);
      }
    } catch (err) {
      console.error('규격 저장 실패:', err);
    }
  };

  // API에서 Slurry 데이터 로드
  useEffect(() => {
    const loadSlurryData = async () => {
      try {
        const data = await getLQCSlurryData(projectId, 'C'); // 양극(Cathode)
        setSlurryData(data);
      } catch (err) {
        console.error('Slurry 데이터 로드 실패:', err);
      }
    };

    loadSlurryData();
  }, [projectId]);

  // Binder 차트 데이터
  const binderChartData = {
    labels: binderData.map((_, index) => (index + 1).toString()),
    datasets: [
      {
        type: 'bar' as const,
        label: '고형분',
        data: binderData.map(row => calcSolidContentAvg(row.solidContent1, row.solidContent2, row.solidContent3)),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
        order: 2,
      },
      {
        type: 'line' as const,
        label: '점도',
        data: binderData.map(row => parseFloat(row.viscosity) || null),
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
    labels: slurryData.map((_, index) => (index + 1).toString()),
    datasets: [
      {
        type: 'bar' as const,
        label: '고형분',
        data: slurryData.map(row =>
          calcSolidContentAvg(row.solidContent1Percentage, row.solidContent2Percentage, row.solidContent3Percentage)
        ),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
        order: 3,
      },
      {
        type: 'line' as const,
        label: '점도',
        data: slurryData.map(row => parseFloat(row.viscosityAfterStabilization) || null),
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
        data: slurryData.map(row => row.grindGageFineParticle2),
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

  // 규격에서 차트 Y축 최대값 계산 (올림 처리)
  // 규격이 없으면 실데이터 최대값 기준으로 계산
  const getViscosityMax = (specs: Record<string, SpecValue>, data: BinderData[], defaultMax: number) => {
    const viscosity = specs.viscosity;
    if (viscosity?.target !== undefined && viscosity?.tolerance !== undefined) {
      const max = viscosity.target + viscosity.tolerance;
      return Math.ceil(max / 1000) * 1000; // 1000 단위 올림
    }
    // 규격 없으면 실데이터 최대값 기준
    if (data.length > 0) {
      const dataMax = Math.max(...data.map(row => parseFloat(row.viscosity) || 0));
      if (dataMax > 0) {
        return Math.ceil(dataMax / 1000) * 1000; // 1000 단위 올림
      }
    }
    return defaultMax;
  };

  const getSolidContentMax = () => {
    return 10;
  };

  // Slurry용 Y축 최대값 계산 함수
  const getSlurryViscosityMax = (specs: Record<string, SpecValue>, data: SlurryData[], defaultMax: number) => {
    const viscosity = specs.viscosity;
    if (viscosity?.target !== undefined && viscosity?.tolerance !== undefined) {
      const max = viscosity.target + viscosity.tolerance;
      return Math.ceil(max / 1000) * 1000;
    }
    if (data.length > 0) {
      const dataMax = Math.max(...data.map(row => parseFloat(row.viscosityAfterStabilization) || 0));
      if (dataMax > 0) {
        return Math.ceil(dataMax / 1000) * 1000;
      }
    }
    return defaultMax;
  };

  const getSlurryParticleSizeMax = (specs: Record<string, SpecValue>, data: SlurryData[], defaultMax: number) => {
    const particleSize = specs.particleSize;
    if (particleSize?.max !== undefined) {
      return Math.ceil(particleSize.max);
    }
    if (data.length > 0) {
      const dataMax = Math.max(...data.map(row => row.grindGageFineParticle2 || 0));
      return Math.ceil(dataMax);
    }
    return defaultMax;
  };

  const getSlurrySolidContentMax = (specs: Record<string, SpecValue>, data: SlurryData[], defaultMax: number) => {
    const roundUpWithPadding = (value: number) => Math.ceil(value / 10) * 10 + 10;

    const solidContent = specs.solidContent;
    if (solidContent?.target !== undefined && solidContent?.tolerance !== undefined) {
      const max = solidContent.target + solidContent.tolerance;
      return roundUpWithPadding(max);
    }
    if (data.length > 0) {
      const avgValues = data
        .map(row =>
          calcSolidContentAvg(row.solidContent1Percentage, row.solidContent2Percentage, row.solidContent3Percentage)
        )
        .filter((v): v is number => v !== null);
      if (avgValues.length > 0) {
        const dataMax = Math.max(...avgValues);
        return roundUpWithPadding(dataMax);
      }
    }
    return defaultMax;
  };

  // 슬러리 데이터 존재 여부
  const hasSlurryData = slurryData.length > 0;

  // 규격 설정 여부 확인
  const hasBinderSpecs = Object.keys(binderSpecs).length > 0;
  const hasSlurrySpecs = Object.keys(slurrySpecs).length > 0;

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
        max: getViscosityMax(binderSpecs, binderData, 4000),
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: '고형분(%)',
        },
        min: 0,
        max: getSolidContentMax(),
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
        max: getSlurryViscosityMax(slurrySpecs, slurryData, 8000),
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: '고형분(%)/입도(㎛)',
        },
        min: 0,
        max: Math.max(
          getSlurrySolidContentMax(slurrySpecs, slurryData, 70),
          getSlurryParticleSizeMax(slurrySpecs, slurryData, 50)
        ),
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
            {hasBinderSpecs ? '규격 수정' : '규격 설정'}
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
                {binderData.length > 0 ? (
                  binderData.map((row, index) => (
                    <tr key={`${row.id}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.manufactureDate}</td>
                      <td>{row.lot}</td>
                      <td>{row.solidContent1 || ''}</td>
                      <td>{row.solidContent2 || ''}</td>
                      <td>{row.solidContent3 || ''}</td>
                      <td>
                        {calcSolidContentAvg(row.solidContent1, row.solidContent2, row.solidContent3)?.toFixed(2) ?? ''}
                      </td>
                      <td>{row.viscosity ? parseFloat(row.viscosity).toLocaleString() : ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className={styles.noDataRow}>
                      데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {binderData.length > 0 ? (
            <div className={styles.chartWrapper}>
              <Bar data={binderChartData as any} options={binderChartOptions} />
            </div>
          ) : (
            <div className={styles.noDataChart}>데이터 없음</div>
          )}
        </div>
      </div>

      {/* Slurry Mixing 검사 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>Slurry Mixing 검사 (양극)</h3>
          <button className={styles.specButton} onClick={() => handleOpenSpecModal('slurry')}>
            {hasSlurrySpecs ? '규격 수정' : '규격 설정'}
          </button>
        </div>
        <div className={styles.tableChartWrapper}>
          <div className={styles.tableWrapper}>
            <table className={styles.lqcTable}>
              <thead>
                <tr>
                  <th rowSpan={2}>No.</th>
                  <th rowSpan={2}>제조일자</th>
                  <th rowSpan={2}>Lot</th>
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
                {slurryData.length > 0 ? (
                  slurryData.map((row, index) => (
                    <tr key={`${row.id}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.manufactureDate}</td>
                      <td>{row.lot}</td>
                      <td>{row.solidContent1Percentage || ''}</td>
                      <td>{row.solidContent2Percentage || ''}</td>
                      <td>{row.solidContent3Percentage || ''}</td>
                      <td>
                        {calcSolidContentAvg(
                          row.solidContent1Percentage,
                          row.solidContent2Percentage,
                          row.solidContent3Percentage
                        )?.toFixed(2) ?? ''}
                      </td>
                      <td>
                        {row.viscosityAfterStabilization
                          ? parseFloat(row.viscosityAfterStabilization).toLocaleString()
                          : ''}
                      </td>
                      <td>{row.grindGageFineParticle2 ?? ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className={styles.noDataRow}>
                      데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {hasSlurryData ? (
            <div className={styles.chartWrapper}>
              <Bar data={slurryChartData as any} options={slurryChartOptions} />
            </div>
          ) : (
            <div className={styles.noDataChart}>데이터 없음</div>
          )}
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
