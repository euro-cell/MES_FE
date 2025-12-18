import React from 'react';
import styles from '../../../../../styles/production/status/ProductionStatusGrid.module.css';
import {
  PROCESS_NAME_MAP,
  PROCESS_UNIT_MAP,
  SEALING_NCR_SUBTYPES,
  SEALING_NCR_SUBTYPE_LABELS,
  CHANGE_BUTTON_STYLE,
} from './constants';
import type { SealingProcessData, SealingDayData, ProcessGridProps } from './types';

interface SealingProcessGridProps extends ProcessGridProps {
  processKey: string;
  processData: SealingProcessData;
}

export default function SealingProcessGrid({
  processKey,
  processData,
  daysInMonth,
  onTargetChange,
}: SealingProcessGridProps) {
  const processName = PROCESS_NAME_MAP[processKey] || processKey;
  const processUnit = PROCESS_UNIT_MAP[processKey] || 'ea';

  // 일별 데이터 매핑
  const dailyDataMap: Record<number, SealingDayData> = {};
  processData.data.forEach(item => {
    dailyDataMap[item.day] = item;
  });

  const ncrRowCount = SEALING_NCR_SUBTYPES.length;
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
            <button onClick={() => onTargetChange('sealing')} style={CHANGE_BUTTON_STYLE}>
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
      {SEALING_NCR_SUBTYPES.map((subType, idx) => {
        if (idx === 0) {
          return (
            <tr key={`${processKey}-ncr-${subType}`}>
              <td rowSpan={ncrRowCount} className={styles.rowLabel}>
                NCR
              </td>
              <td className={styles.subTypeLabel}>{SEALING_NCR_SUBTYPE_LABELS[subType]}</td>
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
            <td className={styles.subTypeLabel}>{SEALING_NCR_SUBTYPE_LABELS[subType]}</td>
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
