import React from 'react';
import styles from '../../../../../styles/production/status/ProductionStatusGrid.module.css';
import { PROCESS_NAME_MAP, PROCESS_UNIT_MAP, CHANGE_BUTTON_STYLE } from './constants';
import type { ProcessData, DayData, ProcessGridProps } from './types';

interface NormalProcessGridProps extends ProcessGridProps {
  processKey: string;
  processData: ProcessData;
  hasSubTypeProcess: boolean;
}

export default function NormalProcessGrid({
  processKey,
  processData,
  daysInMonth,
  hasSubTypeProcess,
  onTargetChange,
}: NormalProcessGridProps) {
  const processName = PROCESS_NAME_MAP[processKey] || processKey;
  const processUnit = PROCESS_UNIT_MAP[processKey] || 'ea';

  // 일별 데이터 매핑
  const dailyDataMap: Record<number, DayData> = {};
  processData.data.forEach(item => {
    dailyDataMap[item.day] = item;
  });

  // NG와 수율 합계 계산
  const totalNG = processData.data.reduce((sum, item) => sum + (item.ng || 0), 0);
  const averageYield =
    processData.total.totalOutput > 0
      ? ((processData.total.totalOutput - totalNG) / processData.total.totalOutput) * 100
      : 0;

  return (
    <React.Fragment>
      {/* 생산량 행 */}
      <tr>
        <td rowSpan={3} className={styles.processHeader}>
          {processName}
        </td>
        <td className={styles.rowLabel} colSpan={hasSubTypeProcess ? 2 : 1}>
          생산량({processUnit})
        </td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return <td key={day}>{dayData?.output || ''}</td>;
        })}
        <td style={{ borderLeft: '2px solid #374151' }}>{processData.total.totalOutput}</td>
        <td rowSpan={3} style={{ borderBottom: '2px solid #9ca3af' }}>
          {processData.total.cumulativeOutput !== null &&
          processData.total.cumulativeOutput !== undefined
            ? processData.total.cumulativeOutput.toLocaleString()
            : ''}
        </td>
        <td rowSpan={3} style={{ borderBottom: '2px solid #9ca3af' }}>
          {processData.total.progress !== null ? `${processData.total.progress}%` : ''}
        </td>
        <td rowSpan={3} style={{ borderBottom: '2px solid #9ca3af' }}>
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
        <td className={styles.rowLabel} colSpan={hasSubTypeProcess ? 2 : 1}>
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
        <td style={{ color: '#ef4444', fontWeight: 500, borderLeft: '2px solid #374151' }}>
          {totalNG}
        </td>
      </tr>

      {/* 수율 행 */}
      <tr>
        <td
          className={styles.rowLabel}
          colSpan={hasSubTypeProcess ? 2 : 1}
          style={{ borderBottom: '2px solid #9ca3af' }}
        >
          수율(%)
        </td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return (
            <td
              key={day}
              style={{
                color: '#10b981',
                fontWeight: 600,
                borderBottom: '2px solid #9ca3af',
              }}
            >
              {dayData?.yield !== null && dayData?.yield !== undefined
                ? `${dayData.yield.toFixed(1)}%`
                : ''}
            </td>
          );
        })}
        <td
          style={{
            color: '#10b981',
            fontWeight: 600,
            borderBottom: '2px solid #9ca3af',
            borderLeft: '2px solid #374151',
          }}
        >
          {averageYield.toFixed(1)}%
        </td>
      </tr>
    </React.Fragment>
  );
}
