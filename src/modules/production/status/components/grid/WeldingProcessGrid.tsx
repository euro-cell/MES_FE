import React from 'react';
import styles from '../../../../../styles/production/status/ProductionStatusGrid.module.css';
import {
  PROCESS_NAME_MAP,
  PROCESS_UNIT_MAP,
  PRE_WELDING_NCR_SUBTYPES,
  PRE_WELDING_NCR_SUBTYPE_LABELS,
  MAIN_WELDING_NCR_SUBTYPES,
  MAIN_WELDING_NCR_SUBTYPE_LABELS,
  CHANGE_BUTTON_STYLE,
} from './constants';
import type { WeldingProcessData, WeldingDayData, ProcessGridProps } from './types';

interface WeldingProcessGridProps extends ProcessGridProps {
  processKey: string;
  processData: WeldingProcessData;
}

export default function WeldingProcessGrid({
  processKey,
  processData,
  daysInMonth,
  onTargetChange,
}: WeldingProcessGridProps) {
  const processName = PROCESS_NAME_MAP[processKey] || processKey;
  const processUnit = PROCESS_UNIT_MAP[processKey] || 'ea';
  const isPreWelding = processKey === 'preWelding';

  // 일별 데이터 매핑
  const dailyDataMap: Record<number, WeldingDayData> = {};
  processData.data.forEach(item => {
    dailyDataMap[item.day] = item;
  });

  // NCR 서브타입 결정 (preWelding vs mainWelding)
  const ncrSubtypes = isPreWelding ? PRE_WELDING_NCR_SUBTYPES : MAIN_WELDING_NCR_SUBTYPES;
  const ncrLabels = isPreWelding
    ? PRE_WELDING_NCR_SUBTYPE_LABELS
    : MAIN_WELDING_NCR_SUBTYPE_LABELS;
  const ncrRowCount = ncrSubtypes.length;
  const totalRowSpan = 3 + ncrRowCount; // 생산량 + NG + NCR 서브타입들 + 수율

  return (
    <React.Fragment>
      {/* 생산량 행 */}
      <tr>
        <td rowSpan={totalRowSpan} className={styles.processHeader}>
          {processName}
        </td>
        <td className={styles.rowLabel} colSpan={2}>
          생산량({processUnit})
        </td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return <td key={day}>{dayData?.output || ''}</td>;
        })}
        <td style={{ borderLeft: '2px solid #374151' }}>{processData.total.totalOutput}</td>
        <td rowSpan={totalRowSpan} style={{ borderBottom: '2px solid #9ca3af' }}>
          {processData.total.cumulativeOutput !== null &&
          processData.total.cumulativeOutput !== undefined
            ? processData.total.cumulativeOutput.toLocaleString()
            : ''}
        </td>
        <td rowSpan={totalRowSpan} style={{ borderBottom: '2px solid #9ca3af' }}>
          {processData.total.progress !== null ? `${processData.total.progress}%` : ''}
        </td>
        <td rowSpan={totalRowSpan} style={{ borderBottom: '2px solid #9ca3af' }}>
          <div>
            {processData.total.targetQuantity !== null
              ? processData.total.targetQuantity.toLocaleString()
              : ''}
          </div>
          {onTargetChange && (
            <button onClick={() => onTargetChange(processKey)} style={CHANGE_BUTTON_STYLE}>
              변경
            </button>
          )}
        </td>
      </tr>

      {/* NG 행 */}
      <tr>
        <td className={styles.rowLabel} colSpan={2}>
          NG
        </td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return (
            <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
              {dayData?.ng !== null && dayData?.ng !== undefined ? dayData.ng : ''}
            </td>
          );
        })}
        <td style={{ borderLeft: '2px solid #374151', color: '#ef4444', fontWeight: 500 }}>
          {processData.total.totalNg !== null ? processData.total.totalNg : ''}
        </td>
      </tr>

      {/* NCR 서브타입 행들 */}
      {ncrSubtypes.map((subType, idx) => {
        if (idx === 0) {
          return (
            <tr key={`${processKey}-ncr-${subType}`}>
              <td rowSpan={ncrRowCount} className={styles.rowLabel}>
                NCR
              </td>
              <td className={styles.subTypeLabel}>{ncrLabels[subType]}</td>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayData = dailyDataMap[day];
                const value = dayData?.ncr?.[subType] ?? null;
                return (
                  <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                    {value !== null && value !== undefined ? value : ''}
                  </td>
                );
              })}
              <td style={{ borderLeft: '2px solid #374151', color: '#ef4444', fontWeight: 500 }}>
                {processData.total.ncr?.[subType] ?? ''}
              </td>
            </tr>
          );
        }
        return (
          <tr key={`${processKey}-ncr-${subType}`}>
            <td className={styles.subTypeLabel}>{ncrLabels[subType]}</td>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayData = dailyDataMap[day];
              const value = dayData?.ncr?.[subType] ?? null;
              return (
                <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                  {value !== null && value !== undefined ? value : ''}
                </td>
              );
            })}
            <td style={{ borderLeft: '2px solid #374151', color: '#ef4444', fontWeight: 500 }}>
              {processData.total.ncr?.[subType] ?? ''}
            </td>
          </tr>
        );
      })}

      {/* 수율 행 */}
      <tr>
        <td className={styles.rowLabel} colSpan={2} style={{ borderBottom: '2px solid #9ca3af' }}>
          수율(%)
        </td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          const yieldValue = dayData?.yield ?? null;
          return (
            <td
              key={day}
              style={{
                color: '#10b981',
                fontWeight: 600,
                borderBottom: '2px solid #9ca3af',
              }}
            >
              {yieldValue !== null ? `${yieldValue.toFixed(1)}%` : ''}
            </td>
          );
        })}
        <td
          style={{
            borderLeft: '2px solid #374151',
            color: '#10b981',
            fontWeight: 600,
            borderBottom: '2px solid #9ca3af',
          }}
        >
          {processData.total.totalYield !== null ? `${processData.total.totalYield}%` : ''}
        </td>
      </tr>
    </React.Fragment>
  );
}
