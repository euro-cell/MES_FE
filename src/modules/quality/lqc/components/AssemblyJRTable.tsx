import { useState, useEffect } from 'react';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';
import SpecEditModal from './SpecEditModal';
import {
  getLQCSpecs,
  saveLQCSpec,
  getLQCAssemblyJRData,
  type SpecValue,
  type AssemblyJRData,
} from '../../../../api/quality/LQCService';

interface AssemblyJRTableProps {
  projectId: number;
}

// 규격 필드 정의
const ASSEMBLY_JR_SPEC_FIELDS = [
  { key: 'weight', label: 'J/R 무게', type: 'target-tolerance' as const, unit: 'g' },
  { key: 'diameter', label: 'J/R 직경', type: 'target-tolerance' as const, unit: '㎜' },
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

// 문자열/숫자를 숫자로 변환
const toNumber = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const num = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(num) ? null : num;
};

// 10개 값의 평균 계산 (행 단위)
const calcRowAvg10 = (values: (number | string | null)[]): number | null => {
  const validValues = values.map(toNumber).filter((v): v is number => v !== null);
  if (validValues.length === 0) return null;
  return validValues.reduce((a, b) => a + b, 0) / validValues.length;
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

// 데이터에서 무게 값 배열 추출
const getWeightValues = (row: AssemblyJRData): (number | null)[] => [
  row.weight1, row.weight2, row.weight3, row.weight4, row.weight5,
  row.weight6, row.weight7, row.weight8, row.weight9, row.weight10,
];

// 데이터에서 직경 값 배열 추출
const getDiameterValues = (row: AssemblyJRData): (number | null)[] => [
  row.diameter1, row.diameter2, row.diameter3, row.diameter4, row.diameter5,
  row.diameter6, row.diameter7, row.diameter8, row.diameter9, row.diameter10,
];

export default function AssemblyJRTable({ projectId }: AssemblyJRTableProps) {
  // 규격 모달 상태
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  // 규격 데이터 상태
  const [specs, setSpecs] = useState<Record<string, SpecValue>>({});

  // 측정 데이터 상태
  const [data, setData] = useState<AssemblyJRData[]>([]);

  // API에서 규격 데이터 로드
  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specsData = await getLQCSpecs(projectId, 'AssemblyJR');
        const jrSpec = specsData.find(s => s.itemType === 'jr');
        if (jrSpec) {
          setSpecs(jrSpec.specs);
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
        const result = await getLQCAssemblyJRData(projectId);
        setData(result);
      } catch (error) {
        console.error('Failed to load assembly JR data:', error);
      }
    };
    loadData();
  }, [projectId]);

  // 규격 편집 모달 열기
  const openSpecModal = () => {
    setIsSpecModalOpen(true);
  };

  // 규격 저장 핸들러
  const handleSaveSpec = async (newSpecs: Record<string, SpecValue>) => {
    try {
      await saveLQCSpec(projectId, 'AssemblyJR', 'jr', newSpecs);
      setSpecs(newSpecs);
      setIsSpecModalOpen(false);
    } catch (error) {
      console.error('Failed to save spec:', error);
    }
  };

  // 데이터 존재 여부
  const hasData = data.length > 0;

  // 각 행의 평균값 계산 (프론트에서 계산)
  const rowAvgValues = data.map(d => ({
    weightAvg: calcRowAvg10(getWeightValues(d)),
    diameterAvg: calcRowAvg10(getDiameterValues(d)),
  }));

  // 통계 계산 - 무게
  const weightStats = {
    avg: {
      avg: calcAvg(rowAvgValues.map(d => d.weightAvg)),
      w1: calcAvg(data.map(d => d.weight1)),
      w2: calcAvg(data.map(d => d.weight2)),
      w3: calcAvg(data.map(d => d.weight3)),
      w4: calcAvg(data.map(d => d.weight4)),
      w5: calcAvg(data.map(d => d.weight5)),
      w6: calcAvg(data.map(d => d.weight6)),
      w7: calcAvg(data.map(d => d.weight7)),
      w8: calcAvg(data.map(d => d.weight8)),
      w9: calcAvg(data.map(d => d.weight9)),
      w10: calcAvg(data.map(d => d.weight10)),
    },
    max: {
      avg: calcMax(rowAvgValues.map(d => d.weightAvg)),
      w1: calcMax(data.map(d => d.weight1)),
      w2: calcMax(data.map(d => d.weight2)),
      w3: calcMax(data.map(d => d.weight3)),
      w4: calcMax(data.map(d => d.weight4)),
      w5: calcMax(data.map(d => d.weight5)),
      w6: calcMax(data.map(d => d.weight6)),
      w7: calcMax(data.map(d => d.weight7)),
      w8: calcMax(data.map(d => d.weight8)),
      w9: calcMax(data.map(d => d.weight9)),
      w10: calcMax(data.map(d => d.weight10)),
    },
    min: {
      avg: calcMin(rowAvgValues.map(d => d.weightAvg)),
      w1: calcMin(data.map(d => d.weight1)),
      w2: calcMin(data.map(d => d.weight2)),
      w3: calcMin(data.map(d => d.weight3)),
      w4: calcMin(data.map(d => d.weight4)),
      w5: calcMin(data.map(d => d.weight5)),
      w6: calcMin(data.map(d => d.weight6)),
      w7: calcMin(data.map(d => d.weight7)),
      w8: calcMin(data.map(d => d.weight8)),
      w9: calcMin(data.map(d => d.weight9)),
      w10: calcMin(data.map(d => d.weight10)),
    },
    stdev: {
      avg: calcStdev(rowAvgValues.map(d => d.weightAvg)),
      w1: calcStdev(data.map(d => d.weight1)),
      w2: calcStdev(data.map(d => d.weight2)),
      w3: calcStdev(data.map(d => d.weight3)),
      w4: calcStdev(data.map(d => d.weight4)),
      w5: calcStdev(data.map(d => d.weight5)),
      w6: calcStdev(data.map(d => d.weight6)),
      w7: calcStdev(data.map(d => d.weight7)),
      w8: calcStdev(data.map(d => d.weight8)),
      w9: calcStdev(data.map(d => d.weight9)),
      w10: calcStdev(data.map(d => d.weight10)),
    },
  };

  // 통계 계산 - 직경
  const diameterStats = {
    avg: {
      avg: calcAvg(rowAvgValues.map(d => d.diameterAvg)),
      d1: calcAvg(data.map(d => d.diameter1)),
      d2: calcAvg(data.map(d => d.diameter2)),
      d3: calcAvg(data.map(d => d.diameter3)),
      d4: calcAvg(data.map(d => d.diameter4)),
      d5: calcAvg(data.map(d => d.diameter5)),
      d6: calcAvg(data.map(d => d.diameter6)),
      d7: calcAvg(data.map(d => d.diameter7)),
      d8: calcAvg(data.map(d => d.diameter8)),
      d9: calcAvg(data.map(d => d.diameter9)),
      d10: calcAvg(data.map(d => d.diameter10)),
    },
    max: {
      avg: calcMax(rowAvgValues.map(d => d.diameterAvg)),
      d1: calcMax(data.map(d => d.diameter1)),
      d2: calcMax(data.map(d => d.diameter2)),
      d3: calcMax(data.map(d => d.diameter3)),
      d4: calcMax(data.map(d => d.diameter4)),
      d5: calcMax(data.map(d => d.diameter5)),
      d6: calcMax(data.map(d => d.diameter6)),
      d7: calcMax(data.map(d => d.diameter7)),
      d8: calcMax(data.map(d => d.diameter8)),
      d9: calcMax(data.map(d => d.diameter9)),
      d10: calcMax(data.map(d => d.diameter10)),
    },
    min: {
      avg: calcMin(rowAvgValues.map(d => d.diameterAvg)),
      d1: calcMin(data.map(d => d.diameter1)),
      d2: calcMin(data.map(d => d.diameter2)),
      d3: calcMin(data.map(d => d.diameter3)),
      d4: calcMin(data.map(d => d.diameter4)),
      d5: calcMin(data.map(d => d.diameter5)),
      d6: calcMin(data.map(d => d.diameter6)),
      d7: calcMin(data.map(d => d.diameter7)),
      d8: calcMin(data.map(d => d.diameter8)),
      d9: calcMin(data.map(d => d.diameter9)),
      d10: calcMin(data.map(d => d.diameter10)),
    },
    stdev: {
      avg: calcStdev(rowAvgValues.map(d => d.diameterAvg)),
      d1: calcStdev(data.map(d => d.diameter1)),
      d2: calcStdev(data.map(d => d.diameter2)),
      d3: calcStdev(data.map(d => d.diameter3)),
      d4: calcStdev(data.map(d => d.diameter4)),
      d5: calcStdev(data.map(d => d.diameter5)),
      d6: calcStdev(data.map(d => d.diameter6)),
      d7: calcStdev(data.map(d => d.diameter7)),
      d8: calcStdev(data.map(d => d.diameter8)),
      d9: calcStdev(data.map(d => d.diameter9)),
      d10: calcStdev(data.map(d => d.diameter10)),
    },
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>J/R 검사</h3>
          <button className={styles.specButton} onClick={openSpecModal}>
            규격 설정
          </button>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className={styles.lqcTable}>
            <thead>
              {/* 1행: 대분류 헤더 */}
              <tr>
                <th rowSpan={2}>No.</th>
                <th rowSpan={2}>작업일자</th>
                <th rowSpan={2}>Lot no.</th>
                <th rowSpan={2}>Shift</th>
                <th colSpan={11}>J/R 무게 (g)</th>
                <th colSpan={11}>J/R 직경 (㎜)</th>
              </tr>
              {/* 2행: 소분류 헤더 */}
              <tr>
                <th>평균</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
                <th>6</th>
                <th>7</th>
                <th>8</th>
                <th>9</th>
                <th>10</th>
                <th>평균</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
                <th>6</th>
                <th>7</th>
                <th>8</th>
                <th>9</th>
                <th>10</th>
              </tr>
            </thead>
            <tbody>
              {/* 규격 행 */}
              <tr className={styles.specRow}>
                <td colSpan={4}>규격</td>
                <td colSpan={11}>{formatSpec(specs.weight, 'target-tolerance')}</td>
                <td colSpan={11}>{formatSpec(specs.diameter, 'target-tolerance')}</td>
              </tr>
              {/* 평균 행 */}
              <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                <td colSpan={4}>Ave.</td>
                <td>{formatNumber(weightStats.avg.avg)}</td>
                <td>{formatNumber(weightStats.avg.w1)}</td>
                <td>{formatNumber(weightStats.avg.w2)}</td>
                <td>{formatNumber(weightStats.avg.w3)}</td>
                <td>{formatNumber(weightStats.avg.w4)}</td>
                <td>{formatNumber(weightStats.avg.w5)}</td>
                <td>{formatNumber(weightStats.avg.w6)}</td>
                <td>{formatNumber(weightStats.avg.w7)}</td>
                <td>{formatNumber(weightStats.avg.w8)}</td>
                <td>{formatNumber(weightStats.avg.w9)}</td>
                <td>{formatNumber(weightStats.avg.w10)}</td>
                <td>{formatNumber(diameterStats.avg.avg)}</td>
                <td>{formatNumber(diameterStats.avg.d1)}</td>
                <td>{formatNumber(diameterStats.avg.d2)}</td>
                <td>{formatNumber(diameterStats.avg.d3)}</td>
                <td>{formatNumber(diameterStats.avg.d4)}</td>
                <td>{formatNumber(diameterStats.avg.d5)}</td>
                <td>{formatNumber(diameterStats.avg.d6)}</td>
                <td>{formatNumber(diameterStats.avg.d7)}</td>
                <td>{formatNumber(diameterStats.avg.d8)}</td>
                <td>{formatNumber(diameterStats.avg.d9)}</td>
                <td>{formatNumber(diameterStats.avg.d10)}</td>
              </tr>
              {/* 최대값 행 */}
              <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                <td colSpan={4}>Max.</td>
                <td>{formatNumber(weightStats.max.avg)}</td>
                <td>{formatNumber(weightStats.max.w1)}</td>
                <td>{formatNumber(weightStats.max.w2)}</td>
                <td>{formatNumber(weightStats.max.w3)}</td>
                <td>{formatNumber(weightStats.max.w4)}</td>
                <td>{formatNumber(weightStats.max.w5)}</td>
                <td>{formatNumber(weightStats.max.w6)}</td>
                <td>{formatNumber(weightStats.max.w7)}</td>
                <td>{formatNumber(weightStats.max.w8)}</td>
                <td>{formatNumber(weightStats.max.w9)}</td>
                <td>{formatNumber(weightStats.max.w10)}</td>
                <td>{formatNumber(diameterStats.max.avg)}</td>
                <td>{formatNumber(diameterStats.max.d1)}</td>
                <td>{formatNumber(diameterStats.max.d2)}</td>
                <td>{formatNumber(diameterStats.max.d3)}</td>
                <td>{formatNumber(diameterStats.max.d4)}</td>
                <td>{formatNumber(diameterStats.max.d5)}</td>
                <td>{formatNumber(diameterStats.max.d6)}</td>
                <td>{formatNumber(diameterStats.max.d7)}</td>
                <td>{formatNumber(diameterStats.max.d8)}</td>
                <td>{formatNumber(diameterStats.max.d9)}</td>
                <td>{formatNumber(diameterStats.max.d10)}</td>
              </tr>
              {/* 최소값 행 */}
              <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                <td colSpan={4}>Min.</td>
                <td>{formatNumber(weightStats.min.avg)}</td>
                <td>{formatNumber(weightStats.min.w1)}</td>
                <td>{formatNumber(weightStats.min.w2)}</td>
                <td>{formatNumber(weightStats.min.w3)}</td>
                <td>{formatNumber(weightStats.min.w4)}</td>
                <td>{formatNumber(weightStats.min.w5)}</td>
                <td>{formatNumber(weightStats.min.w6)}</td>
                <td>{formatNumber(weightStats.min.w7)}</td>
                <td>{formatNumber(weightStats.min.w8)}</td>
                <td>{formatNumber(weightStats.min.w9)}</td>
                <td>{formatNumber(weightStats.min.w10)}</td>
                <td>{formatNumber(diameterStats.min.avg)}</td>
                <td>{formatNumber(diameterStats.min.d1)}</td>
                <td>{formatNumber(diameterStats.min.d2)}</td>
                <td>{formatNumber(diameterStats.min.d3)}</td>
                <td>{formatNumber(diameterStats.min.d4)}</td>
                <td>{formatNumber(diameterStats.min.d5)}</td>
                <td>{formatNumber(diameterStats.min.d6)}</td>
                <td>{formatNumber(diameterStats.min.d7)}</td>
                <td>{formatNumber(diameterStats.min.d8)}</td>
                <td>{formatNumber(diameterStats.min.d9)}</td>
                <td>{formatNumber(diameterStats.min.d10)}</td>
              </tr>
              {/* 표준편차 행 */}
              <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                <td colSpan={4}>Stdev.</td>
                <td>{formatNumber(weightStats.stdev.avg, 3)}</td>
                <td>{formatNumber(weightStats.stdev.w1, 3)}</td>
                <td>{formatNumber(weightStats.stdev.w2, 3)}</td>
                <td>{formatNumber(weightStats.stdev.w3, 3)}</td>
                <td>{formatNumber(weightStats.stdev.w4, 3)}</td>
                <td>{formatNumber(weightStats.stdev.w5, 3)}</td>
                <td>{formatNumber(weightStats.stdev.w6, 3)}</td>
                <td>{formatNumber(weightStats.stdev.w7, 3)}</td>
                <td>{formatNumber(weightStats.stdev.w8, 3)}</td>
                <td>{formatNumber(weightStats.stdev.w9, 3)}</td>
                <td>{formatNumber(weightStats.stdev.w10, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.avg, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.d1, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.d2, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.d3, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.d4, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.d5, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.d6, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.d7, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.d8, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.d9, 3)}</td>
                <td>{formatNumber(diameterStats.stdev.d10, 3)}</td>
              </tr>
              {/* 데이터 행 */}
              {hasData ? (
                data.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{row.workDate}</td>
                    <td>{row.lot}</td>
                    <td>{row.shift}</td>
                    <td>{formatNumber(rowAvgValues[index].weightAvg)}</td>
                    <td>{formatNumber(row.weight1)}</td>
                    <td>{formatNumber(row.weight2)}</td>
                    <td>{formatNumber(row.weight3)}</td>
                    <td>{formatNumber(row.weight4)}</td>
                    <td>{formatNumber(row.weight5)}</td>
                    <td>{formatNumber(row.weight6)}</td>
                    <td>{formatNumber(row.weight7)}</td>
                    <td>{formatNumber(row.weight8)}</td>
                    <td>{formatNumber(row.weight9)}</td>
                    <td>{formatNumber(row.weight10)}</td>
                    <td>{formatNumber(rowAvgValues[index].diameterAvg)}</td>
                    <td>{formatNumber(row.diameter1)}</td>
                    <td>{formatNumber(row.diameter2)}</td>
                    <td>{formatNumber(row.diameter3)}</td>
                    <td>{formatNumber(row.diameter4)}</td>
                    <td>{formatNumber(row.diameter5)}</td>
                    <td>{formatNumber(row.diameter6)}</td>
                    <td>{formatNumber(row.diameter7)}</td>
                    <td>{formatNumber(row.diameter8)}</td>
                    <td>{formatNumber(row.diameter9)}</td>
                    <td>{formatNumber(row.diameter10)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={26} className={styles.noDataRow}>
                    데이터 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 규격 설정 모달 */}
      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpec}
        title="J/R 검사"
        specFields={ASSEMBLY_JR_SPEC_FIELDS}
        specs={specs}
      />
    </div>
  );
}
