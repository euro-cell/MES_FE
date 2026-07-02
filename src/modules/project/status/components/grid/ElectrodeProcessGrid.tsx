import React from 'react';
import styles from '../../../../../styles/project/status/ProductionStatusGrid.module.css';
import { PROCESS_NAME_MAP, PROCESS_UNIT_MAP, CHANGE_BUTTON_STYLE, GOOD_CELL_STYLE, GOOD_TOTAL_CELL_STYLE } from './constants';
import type { ProcessData, DayData, ProcessGridProps } from './types';

interface ElectrodeProcessGridProps extends ProcessGridProps {
  processKey: string;
  processData: ProcessData;
  hasSubTypeProcess: boolean;
}

export default function ElectrodeProcessGrid({
  processKey,
  processData,
  daysInMonth,
  hasSubTypeProcess,
  onTargetChange,
}: ElectrodeProcessGridProps) {
  const processName = PROCESS_NAME_MAP[processKey] || processKey;
  const processUnit = PROCESS_UNIT_MAP[processKey] || 'ea';

  // 일별 데이터 매핑
  const dailyDataMap: Record<number, DayData> = {};
  processData.data.forEach(item => {
    dailyDataMap[item.day] = item;
  });

  // NG와 수율 합계 계산
  const totalNG = processData.data.reduce((sum, item) => sum + (item.ng || 0), 0);
  const totalInput = processData.total.totalOutput + totalNG;
  const averageYield = totalInput > 0 ? (processData.total.totalOutput / totalInput) * 100 : 0;
  const totalGood = processData.total.totalOutput - totalNG;

  // Mixing과 Coating Single만 회색 배경 적용 (양품 행 미표시)
  const shouldApplyGrayBg = processKey === 'mixing' || processKey === 'coatingSingle';
  const showGoodRow = !shouldApplyGrayBg;
  const totalRowSpan = showGoodRow ? 4 : 3;

  return (
    <React.Fragment>
      {/* 생산량 행 */}
      <tr>
        <td rowSpan={totalRowSpan} className={styles.processHeader}>
          {processName}
        </td>
        <td className={styles.rowLabel} colSpan={hasSubTypeProcess ? 2 : 1}>
          생산량({processUnit})
        </td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return <td key={day}>{dayData?.output ? dayData.output.toLocaleString() : ''}</td>;
        })}
        <td style={{ borderLeft: '2px solid #374151' }}>{processData.total.totalOutput.toLocaleString()}</td>
        <td rowSpan={totalRowSpan} style={{ borderBottom: '2px solid #9ca3af' }}>
          <div>
            {processData.total.cumulativeOutput !== null &&
            processData.total.cumulativeOutput !== undefined
              ? processData.total.cumulativeOutput.toLocaleString()
              : ''}
          </div>
          {showGoodRow && (
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              {`양품 ${totalGood.toLocaleString()}`}
            </div>
          )}
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

      {/* 양품 행 (mixing, coatingSingle 제외) */}
      {showGoodRow && (
        <tr>
          <td className={styles.rowLabel} colSpan={hasSubTypeProcess ? 2 : 1}>
            양품
          </td>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayData = dailyDataMap[day];
            const good =
              dayData?.output !== undefined && dayData?.ng !== null && dayData?.ng !== undefined
                ? dayData.output - dayData.ng
                : dayData?.output
                  ? dayData.output
                  : null;
            return <td key={day} style={GOOD_CELL_STYLE}>{good !== null ? good.toLocaleString() : ''}</td>;
          })}
          <td style={GOOD_TOTAL_CELL_STYLE}>{totalGood.toLocaleString()}</td>
        </tr>
      )}

      {/* NG 행 */}
      <tr>
        <td className={styles.rowLabel} colSpan={hasSubTypeProcess ? 2 : 1}>
          NG
        </td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return (
            <td
              key={day}
              style={
                shouldApplyGrayBg ? { background: '#d1d5db' } : { color: '#ef4444', fontWeight: 500 }
              }
            >
              {dayData?.ng !== null && dayData?.ng !== undefined ? dayData.ng.toLocaleString() : ''}
            </td>
          );
        })}
        <td
          style={
            shouldApplyGrayBg
              ? { background: '#d1d5db', borderLeft: '2px solid #374151' }
              : { color: '#ef4444', fontWeight: 500, borderLeft: '2px solid #374151' }
          }
        >
          {totalNG.toLocaleString()}
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
              style={
                shouldApplyGrayBg
                  ? { background: '#d1d5db', borderBottom: '2px solid #9ca3af' }
                  : {
                      color: '#10b981',
                      fontWeight: 600,
                      borderBottom: '2px solid #9ca3af',
                    }
              }
            >
              {dayData?.yield !== null && dayData?.yield !== undefined
                ? `${dayData.yield.toFixed(1)}%`
                : ''}
            </td>
          );
        })}
        <td
          style={
            shouldApplyGrayBg
              ? {
                  background: '#d1d5db',
                  borderBottom: '2px solid #9ca3af',
                  borderLeft: '2px solid #374151',
                }
              : {
                  color: '#10b981',
                  fontWeight: 600,
                  borderBottom: '2px solid #9ca3af',
                  borderLeft: '2px solid #374151',
                }
          }
        >
          {averageYield.toFixed(1)}%
        </td>
      </tr>
    </React.Fragment>
  );
}
