import { getDaysInMonth } from '../utils/dateUtils';
import styles from '../../../../styles/production/status/ProductionStatusGrid.module.css';
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

  // 한국 공휴일 체크 함수
  const isHoliday = (year: number, month: number, day: number): boolean => {
    const holidays: Record<string, string> = {
      '1-1': '신정',
      '3-1': '삼일절',
      '5-5': '어린이날',
      '6-6': '현충일',
      '8-15': '광복절',
      '10-3': '개천절',
      '10-9': '한글날',
      '12-25': '크리스마스',
    };

    const lunarHolidays: Record<number, string[]> = {
      2024: ['2-9', '2-10', '2-11', '2-12', '9-16', '9-17', '9-18', '5-6', '5-15'],
      2025: ['1-28', '1-29', '1-30', '1-31', '10-5', '10-6', '10-7', '10-8', '5-5', '8-6'],
      2026: ['2-16', '2-17', '2-18', '2-19', '9-24', '9-25', '9-26', '9-27', '5-19', '8-25'],
    };

    const dateKey = `${month}-${day}`;
    if (holidays[dateKey]) return true;
    if (lunarHolidays[year]?.includes(dateKey)) return true;
    return false;
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
  const calculateTotalOutput = (): number => {
    return processesToRender.reduce((sum, [key, processData]) => {
      if (!processData) return sum;
      if (isVDProcess(key) && isVDProcessData(processData)) {
        const vd = processData as VDProcessData;
        return sum + vd.total.cathode.totalOutput + vd.total.anode.totalOutput;
      }
      if (isFormingProcess(key) && isFormingProcessData(processData)) {
        const forming = processData as FormingProcessData;
        return (
          sum + FORMING_SUBTYPES.reduce((s, subType) => s + forming[subType].total.totalOutput, 0)
        );
      }
      if (isStackingProcess(key) && isStackingProcessData(processData)) {
        return sum + (processData as StackingProcessData).total.totalOutput;
      }
      if (isWeldingProcess(key) && isWeldingProcessData(processData)) {
        return sum + (processData as WeldingProcessData).total.totalOutput;
      }
      if (isSealingProcess(key) && isSealingProcessData(processData)) {
        return sum + (processData as SealingProcessData).total.totalOutput;
      }
      if (isVisualInspectionProcess(key) && isVisualInspectionProcessData(processData)) {
        return sum + (processData as VisualInspectionProcessData).total.totalOutput;
      }
      return sum + ((processData as ProcessData).total.totalOutput || 0);
    }, 0);
  };

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

  const totalOutput = calculateTotalOutput();
  const totalNG = calculateTotalNG();
  const totalTarget = calculateTotalTarget();
  const overallYield = totalOutput > 0 ? ((totalOutput - totalNG) / totalOutput) * 100 : 0;
  const overallProgress = totalTarget > 0 ? (totalOutput / totalTarget) * 100 : 0;

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
