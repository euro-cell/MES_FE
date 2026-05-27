import { getDaysInMonth } from '../utils/dateUtils';
import * as holidaysKr from '@hyunbinseo/holidays-kr';
import styles from '../../../../styles/project/status/ProductionStatusGrid.module.css';
import {
  FORMING_SUBTYPES,
  ElectrodeProcessGrid,
  VDProcessGrid,
  FormingProcessGrid,
  StackingProcessGrid,
  WeldingProcessGrid,
  SealingProcessGrid,
  VisualInspectionProcessGrid,
  NormalProcessGrid,
} from './grid';
import type {
  RealDataResponse,
  ProcessData,
  VDProcessData,
  FormingProcessData,
  StackingProcessData,
  WeldingProcessData,
  SealingProcessData,
  VisualInspectionProcessData,
  AllProcessData,
} from './grid';

interface DataGridProps {
  data: RealDataResponse;
  year: number;
  month: number;
  onTargetChange?: (processKey: string, subType?: string) => void;
}

// 전극 공정 키 목록
const ELECTRODE_PROCESS_KEYS = [
  'mixing',
  'coatingSingle',
  'coatingDouble',
  'press',
  'slitting',
  'notching',
];

export default function DataGrid({ data, year, month, onTargetChange }: DataGridProps) {
  const daysInMonth = getDaysInMonth(year, month);

  const isHoliday = (year: number, month: number, day: number): boolean => {
    const yearData = (holidaysKr as unknown as Record<string, Record<string, readonly string[]>>)[`y${year}`];
    if (!yearData) return false;
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateKey in yearData;
  };

  const getDayOfWeek = (day: number): number => {
    const date = new Date(year, month - 1, day);
    return date.getDay();
  };

  const getDateClassName = (day: number): string => {
    if (isHoliday(year, month, day)) return styles.sunday;
    const dayOfWeek = getDayOfWeek(day);
    if (dayOfWeek === 0) return styles.sunday;
    if (dayOfWeek === 6) return styles.saturday;
    return '';
  };

  if (!data.processes || Object.keys(data.processes).length === 0) {
    return null;
  }

  // 타입 체크 함수들
  const isVDProcess = (key: string): boolean => key === 'vd';
  const isFormingProcess = (key: string): boolean => key === 'forming';
  const isStackingProcess = (key: string): boolean => key === 'stacking';
  const isWeldingProcess = (key: string): boolean => key === 'preWelding' || key === 'mainWelding';
  const isSealingProcess = (key: string): boolean => key === 'sealing';
  const isVisualInspectionProcess = (key: string): boolean => key === 'visualInspection';

  const isVDProcessData = (processData: AllProcessData): processData is VDProcessData => {
    return (
      'data' in processData &&
      Array.isArray(processData.data) &&
      processData.data.length > 0 &&
      'cathodeOutput' in processData.data[0]
    );
  };

  const isFormingProcessData = (processData: AllProcessData): processData is FormingProcessData => {
    return (
      'cutting' in processData &&
      'forming' in processData &&
      'folding' in processData &&
      'topCutting' in processData
    );
  };

  const isStackingProcessData = (
    processData: AllProcessData
  ): processData is StackingProcessData => {
    if (!('total' in processData)) return false;
    const total = (processData as StackingProcessData).total;
    return (
      total.ncr !== undefined && (total.ncr === null || ('hiPot' in total.ncr && 'weight' in total.ncr))
    );
  };

  const isWeldingProcessData = (processData: AllProcessData): processData is WeldingProcessData => {
    if (!('total' in processData)) return false;
    const total = (processData as WeldingProcessData).total;
    return (
      total.ncr !== undefined && (total.ncr === null || 'burning' in total.ncr || 'align' in total.ncr)
    );
  };

  const isSealingProcessData = (processData: AllProcessData): processData is SealingProcessData => {
    if (!('total' in processData)) return false;
    const total = (processData as SealingProcessData).total;
    return (
      total.ncr !== undefined &&
      (total.ncr === null || 'appearance' in total.ncr || 'thickness' in total.ncr)
    );
  };

  const isVisualInspectionProcessData = (
    processData: AllProcessData
  ): processData is VisualInspectionProcessData => {
    if (!('total' in processData)) return false;
    const total = (processData as VisualInspectionProcessData).total;
    return (
      total.ncr !== undefined &&
      (total.ncr === null ||
        'gas' in total.ncr ||
        'foreignMatter' in total.ncr ||
        'cellSize' in total.ncr)
    );
  };

  const processesToRender = Object.entries(data.processes).filter(
    ([_, processData]) => processData !== undefined && processData !== null
  );

  if (processesToRender.length === 0) {
    return null;
  }

  const hasSubTypeProcess = processesToRender.some(
    ([key]) =>
      isVDProcess(key) ||
      isFormingProcess(key) ||
      isStackingProcess(key) ||
      isWeldingProcess(key) ||
      isSealingProcess(key) ||
      isVisualInspectionProcess(key)
  );

  // 공정별 렌더링 함수
  const renderProcess = (processKey: string, processData: AllProcessData) => {
    // VD 공정
    if (isVDProcess(processKey) && isVDProcessData(processData)) {
      return (
        <VDProcessGrid
          key={processKey}
          processKey={processKey}
          processData={processData}
          daysInMonth={daysInMonth}
          getDateClassName={getDateClassName}
          onTargetChange={onTargetChange}
        />
      );
    }

    // Forming 공정
    if (isFormingProcess(processKey) && isFormingProcessData(processData)) {
      return (
        <FormingProcessGrid
          key={processKey}
          processKey={processKey}
          processData={processData}
          daysInMonth={daysInMonth}
          getDateClassName={getDateClassName}
          onTargetChange={onTargetChange}
        />
      );
    }

    // Stacking 공정
    if (isStackingProcess(processKey) && isStackingProcessData(processData)) {
      return (
        <StackingProcessGrid
          key={processKey}
          processKey={processKey}
          processData={processData}
          daysInMonth={daysInMonth}
          getDateClassName={getDateClassName}
          onTargetChange={onTargetChange}
        />
      );
    }

    // Welding 공정
    if (isWeldingProcess(processKey) && isWeldingProcessData(processData)) {
      return (
        <WeldingProcessGrid
          key={processKey}
          processKey={processKey}
          processData={processData}
          daysInMonth={daysInMonth}
          getDateClassName={getDateClassName}
          onTargetChange={onTargetChange}
        />
      );
    }

    // Sealing 공정
    if (isSealingProcess(processKey) && isSealingProcessData(processData)) {
      return (
        <SealingProcessGrid
          key={processKey}
          processKey={processKey}
          processData={processData}
          daysInMonth={daysInMonth}
          getDateClassName={getDateClassName}
          onTargetChange={onTargetChange}
        />
      );
    }

    // VisualInspection 공정
    if (isVisualInspectionProcess(processKey) && isVisualInspectionProcessData(processData)) {
      return (
        <VisualInspectionProcessGrid
          key={processKey}
          processKey={processKey}
          processData={processData}
          daysInMonth={daysInMonth}
          getDateClassName={getDateClassName}
          onTargetChange={onTargetChange}
        />
      );
    }

    // 전극 공정
    if (ELECTRODE_PROCESS_KEYS.includes(processKey)) {
      return (
        <ElectrodeProcessGrid
          key={processKey}
          processKey={processKey}
          processData={processData as ProcessData}
          daysInMonth={daysInMonth}
          hasSubTypeProcess={hasSubTypeProcess}
          getDateClassName={getDateClassName}
          onTargetChange={onTargetChange}
        />
      );
    }

    // 일반 공정 (화성 공정 등)
    return (
      <NormalProcessGrid
        key={processKey}
        processKey={processKey}
        processData={processData as ProcessData}
        daysInMonth={daysInMonth}
        hasSubTypeProcess={hasSubTypeProcess}
        getDateClassName={getDateClassName}
        onTargetChange={onTargetChange}
      />
    );
  };

  // 합계 계산 함수

  const calculateTotalNG = (): number => {
    return processesToRender.reduce((sum, [key, processData]) => {
      if (!processData) return sum;
      if (isVDProcess(key) && isVDProcessData(processData)) {
        const vd = processData as VDProcessData;
        return sum + (vd.total.cathode.totalNg || 0) + (vd.total.anode.totalNg || 0);
      }
      if (isFormingProcess(key) && isFormingProcessData(processData)) {
        const forming = processData as FormingProcessData;
        return (
          sum +
          FORMING_SUBTYPES.reduce((s, subType) => s + (forming[subType].total.totalNg || 0), 0)
        );
      }
      if (isStackingProcess(key) && isStackingProcessData(processData)) {
        return sum + ((processData as StackingProcessData).total.totalNg || 0);
      }
      if (isWeldingProcess(key) && isWeldingProcessData(processData)) {
        return sum + ((processData as WeldingProcessData).total.totalNg || 0);
      }
      if (isSealingProcess(key) && isSealingProcessData(processData)) {
        return sum + ((processData as SealingProcessData).total.totalNg || 0);
      }
      if (isVisualInspectionProcess(key) && isVisualInspectionProcessData(processData)) {
        return sum + ((processData as VisualInspectionProcessData).total.totalNg || 0);
      }
      return sum + ((processData as ProcessData).total.totalNg || 0);
    }, 0);
  };

  const calculateTotalTarget = (): number => {
    return processesToRender.reduce((sum, [key, processData]) => {
      if (!processData) return sum;
      if (isVDProcess(key) && isVDProcessData(processData)) {
        const vd = processData as VDProcessData;
        return (
          sum + (vd.total.cathode.targetQuantity || 0) + (vd.total.anode.targetQuantity || 0)
        );
      }
      if (isFormingProcess(key) && isFormingProcessData(processData)) {
        return sum + ((processData as FormingProcessData).targetQuantity || 0);
      }
      if (isStackingProcess(key) && isStackingProcessData(processData)) {
        return sum + ((processData as StackingProcessData).total.targetQuantity || 0);
      }
      if (isWeldingProcess(key) && isWeldingProcessData(processData)) {
        return sum + ((processData as WeldingProcessData).total.targetQuantity || 0);
      }
      if (isSealingProcess(key) && isSealingProcessData(processData)) {
        return sum + ((processData as SealingProcessData).total.targetQuantity || 0);
      }
      if (isVisualInspectionProcess(key) && isVisualInspectionProcessData(processData)) {
        return sum + ((processData as VisualInspectionProcessData).total.targetQuantity || 0);
      }
      return sum + ((processData as ProcessData).total.targetQuantity || 0);
    }, 0);
  };

  // target이 있는 공정만 output/target 합산하여 진행률 계산
  const calculateProgressOnlyOutput = (): number => {
    return processesToRender.reduce((sum, [key, processData]) => {
      if (!processData) return sum;
      if (isVDProcess(key) && isVDProcessData(processData)) {
        const vd = processData as VDProcessData;
        let s = sum;
        if (vd.total.cathode.targetQuantity) s += vd.total.cathode.totalOutput;
        if (vd.total.anode.targetQuantity) s += vd.total.anode.totalOutput;
        return s;
      }
      if (isFormingProcess(key) && isFormingProcessData(processData)) {
        const forming = processData as FormingProcessData;
        return (processData as FormingProcessData).targetQuantity
          ? sum + FORMING_SUBTYPES.reduce((s, subType) => s + forming[subType].total.totalOutput, 0)
          : sum;
      }
      if (isStackingProcess(key) && isStackingProcessData(processData)) {
        const pd = processData as StackingProcessData;
        return pd.total.targetQuantity ? sum + pd.total.totalOutput : sum;
      }
      if (isWeldingProcess(key) && isWeldingProcessData(processData)) {
        const pd = processData as WeldingProcessData;
        return pd.total.targetQuantity ? sum + pd.total.totalOutput : sum;
      }
      if (isSealingProcess(key) && isSealingProcessData(processData)) {
        const pd = processData as SealingProcessData;
        return pd.total.targetQuantity ? sum + pd.total.totalOutput : sum;
      }
      if (isVisualInspectionProcess(key) && isVisualInspectionProcessData(processData)) {
        const pd = processData as VisualInspectionProcessData;
        return pd.total.targetQuantity ? sum + pd.total.totalOutput : sum;
      }
      const pd = processData as ProcessData;
      return pd.total.targetQuantity ? sum + (pd.total.totalOutput || 0) : sum;
    }, 0);
  };

  // NG 데이터가 있는 공정만 output/ng 합산하여 수율 계산
  const calculateYieldOnlyOutput = (): number => {
    return processesToRender.reduce((sum, [key, processData]) => {
      if (!processData) return sum;
      if (isVDProcess(key) && isVDProcessData(processData)) {
        const vd = processData as VDProcessData;
        let s = sum;
        if (vd.total.cathode.totalNg) s += vd.total.cathode.totalOutput;
        if (vd.total.anode.totalNg) s += vd.total.anode.totalOutput;
        return s;
      }
      if (isFormingProcess(key) && isFormingProcessData(processData)) {
        const forming = processData as FormingProcessData;
        const hasNg = FORMING_SUBTYPES.some(subType => forming[subType].total.totalNg);
        return hasNg ? sum + FORMING_SUBTYPES.reduce((s, subType) => s + forming[subType].total.totalOutput, 0) : sum;
      }
      if (isStackingProcess(key) && isStackingProcessData(processData)) {
        const pd = processData as StackingProcessData;
        return pd.total.totalNg ? sum + pd.total.totalOutput : sum;
      }
      if (isWeldingProcess(key) && isWeldingProcessData(processData)) {
        const pd = processData as WeldingProcessData;
        return pd.total.totalNg ? sum + pd.total.totalOutput : sum;
      }
      if (isSealingProcess(key) && isSealingProcessData(processData)) {
        const pd = processData as SealingProcessData;
        return pd.total.totalNg ? sum + pd.total.totalOutput : sum;
      }
      if (isVisualInspectionProcess(key) && isVisualInspectionProcessData(processData)) {
        const pd = processData as VisualInspectionProcessData;
        return pd.total.totalNg ? sum + pd.total.totalOutput : sum;
      }
      const pd = processData as ProcessData;
      return pd.total.totalNg ? sum + (pd.total.totalOutput || 0) : sum;
    }, 0);
  };

  const totalNG = calculateTotalNG();
  const totalTarget = calculateTotalTarget();
  const progressOnlyOutput = calculateProgressOnlyOutput();
  const yieldOnlyOutput = calculateYieldOnlyOutput();
  const overallYield = yieldOnlyOutput > 0 ? ((yieldOnlyOutput - totalNG) / yieldOnlyOutput) * 100 : 0;
  const overallProgress = totalTarget > 0 ? (progressOnlyOutput / totalTarget) * 100 : 0;

  return (
    <div className={styles.gridContainer}>
      <table className={styles.statusTable}>
        <thead>
          <tr>
            <th className={styles.processColumn} colSpan={hasSubTypeProcess ? 3 : 2}>
              제조일자
            </th>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              return (
                <th key={day} className={getDateClassName(day)}>
                  {day}
                </th>
              );
            })}
            <th style={{ borderLeft: '2px solid #374151' }}>합계</th>
            <th>전체 합계</th>
            <th>진행률</th>
            <th>목표수량</th>
          </tr>
        </thead>
        <tbody>
          {processesToRender.map(([processKey, processData]) => {
            if (!processData) return null;
            return renderProcess(processKey, processData);
          })}

          {/* 전체 합계 행 */}
          <tr className={styles.totalRow}>
            <td
              colSpan={daysInMonth + (hasSubTypeProcess ? 3 : 2)}
              style={{ borderRight: '2px solid #374151' }}
            >
              합계
            </td>
            <td></td>
            <td className={styles.yieldCell}>{overallYield.toFixed(1)}%</td>
            <td>{totalTarget > 0 ? `${overallProgress.toFixed(1)}%` : ''}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
