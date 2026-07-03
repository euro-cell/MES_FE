import React from 'react';
import styles from '../../../../../styles/project/status/ProductionStatusGrid.module.css';
import {
  PROCESS_NAME_MAP,
  PROCESS_UNIT_MAP,
  FORMING_SUBTYPES,
  FORMING_SUBTYPE_LABELS,
  CHANGE_BUTTON_STYLE,
  GOOD_CELL_STYLE,
  GOOD_TOTAL_CELL_STYLE,
} from './constants';
import type { FormingProcessData, FormingSubTypeDayData, ProcessGridProps } from './types';

interface FormingProcessGridProps extends ProcessGridProps {
  processKey: string;
  processData: FormingProcessData;
}

export default function FormingProcessGrid({
  processKey,
  processData,
  daysInMonth,
  onTargetChange,
}: FormingProcessGridProps) {
  const processName = PROCESS_NAME_MAP[processKey] || processKey;
  const processUnit = PROCESS_UNIT_MAP[processKey] || 'ea';

  // yield 데이터 매핑
  const yieldDataMap: Record<number, number | null> = {};
  processData.yield.data.forEach(item => {
    yieldDataMap[item.day] = item.yield;
  });

  return (
    <React.Fragment>
      {/* 생산량 - 4개 서브타입 */}
      {FORMING_SUBTYPES.map((subType, idx) => {
        const subData = processData[subType];
        const subDailyDataMap: Record<number, FormingSubTypeDayData> = {};
        subData.data.forEach(item => {
          subDailyDataMap[item.day] = item;
        });

        if (idx === 0) {
          // 첫 번째 서브타입 (Cutting) - 진행률과 목표수량은 1칸씩
          return (
            <tr key={`${processKey}-output-${subType}`}>
              <td rowSpan={10} className={styles.processHeader}>
                {processName}
              </td>
              <td rowSpan={4} className={styles.rowLabel}>
                생산량({processUnit})
              </td>
              <td className={styles.subTypeLabel}>{FORMING_SUBTYPE_LABELS[subType]}</td>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayData = subDailyDataMap[day];
                return <td key={day}>{dayData?.output ? dayData.output.toLocaleString() : ''}</td>;
              })}
              <td style={{ borderLeft: '2px solid #374151' }}>{subData.total.totalOutput.toLocaleString()}</td>
              <td rowSpan={10} style={{ borderBottom: '2px solid #9ca3af' }}>
                <div>
                  {processData.cumulativeOutput !== null &&
                  processData.cumulativeOutput !== undefined
                    ? processData.cumulativeOutput.toLocaleString()
                    : ''}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {(() => {
                    const lastSubType = [...FORMING_SUBTYPES].reverse().find(st => processData[st].total.totalOutput > 0);
                    if (!lastSubType) return '';
                    const { totalOutput, totalNg } = processData[lastSubType].total;
                    return `양품 ${(totalOutput - (totalNg ?? 0)).toLocaleString()}`;
                  })()}
                </div>
              </td>
              <td rowSpan={10} style={{ borderBottom: '2px solid #9ca3af' }}>
                {processData.progress !== null ? `${processData.progress}%` : ''}
              </td>
              <td rowSpan={10} style={{ borderBottom: '2px solid #9ca3af' }}>
                <div>
                  {processData.targetQuantity !== null
                    ? processData.targetQuantity.toLocaleString()
                    : ''}
                </div>
                {onTargetChange && (
                  <button onClick={() => onTargetChange('forming')} style={CHANGE_BUTTON_STYLE}>
                    변경
                  </button>
                )}
              </td>
            </tr>
          );
        }
        return (
          <tr key={`${processKey}-output-${subType}`}>
            <td className={styles.subTypeLabel}>{FORMING_SUBTYPE_LABELS[subType]}</td>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayData = subDailyDataMap[day];
              return <td key={day}>{dayData?.output || ''}</td>;
            })}
            <td style={{ borderLeft: '2px solid #374151' }}>{subData.total.totalOutput}</td>
          </tr>
        );
      })}

      {/* 양품 - 각 날짜/합계별 마지막으로 데이터가 있는 단계 기준 */}
      <tr key={`${processKey}-good`}>
        <td className={styles.rowLabel} colSpan={2}>
          양품
        </td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          // 역순으로 탐색해 해당 날짜에 output이 있는 마지막 단계 찾기
          const lastSubType = [...FORMING_SUBTYPES].reverse().find(st => {
            const map: Record<number, FormingSubTypeDayData> = {};
            processData[st].data.forEach(item => { map[item.day] = item; });
            return map[day]?.output;
          });
          if (!lastSubType) return <td key={day} style={GOOD_CELL_STYLE}></td>;
          const map: Record<number, FormingSubTypeDayData> = {};
          processData[lastSubType].data.forEach(item => { map[item.day] = item; });
          const d = map[day];
          const good = d.output - (d.ng ?? 0);
          return <td key={day} style={GOOD_CELL_STYLE}>{good.toLocaleString()}</td>;
        })}
        <td style={GOOD_TOTAL_CELL_STYLE}>
          {(() => {
            // 합계도 마지막으로 totalOutput이 있는 단계 기준
            const lastSubType = [...FORMING_SUBTYPES].reverse().find(st => processData[st].total.totalOutput > 0);
            if (!lastSubType) return '0';
            const { totalOutput, totalNg } = processData[lastSubType].total;
            return (totalOutput - (totalNg ?? 0)).toLocaleString();
          })()}
        </td>
      </tr>

      {/* NG - 4개 서브타입 */}
      {FORMING_SUBTYPES.map((subType, idx) => {
        const subData = processData[subType];
        const subDailyDataMap: Record<number, FormingSubTypeDayData> = {};
        subData.data.forEach(item => {
          subDailyDataMap[item.day] = item;
        });

        if (idx === 0) {
          return (
            <tr key={`${processKey}-ng-${subType}`}>
              <td rowSpan={4} className={styles.rowLabel}>
                NG
              </td>
              <td className={styles.subTypeLabel}>{FORMING_SUBTYPE_LABELS[subType]}</td>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayData = subDailyDataMap[day];
                return (
                  <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                    {dayData?.ng !== null && dayData?.ng !== undefined ? dayData.ng.toLocaleString() : ''}
                  </td>
                );
              })}
              <td style={{ borderLeft: '2px solid #374151', color: '#ef4444', fontWeight: 500 }}>
                {subData.total.totalNg?.toLocaleString() ?? ''}
              </td>
            </tr>
          );
        }
        return (
          <tr key={`${processKey}-ng-${subType}`}>
            <td className={styles.subTypeLabel}>{FORMING_SUBTYPE_LABELS[subType]}</td>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayData = subDailyDataMap[day];
              return (
                <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
                  {dayData?.ng !== null && dayData?.ng !== undefined ? dayData.ng : ''}
                </td>
              );
            })}
            <td style={{ borderLeft: '2px solid #374151', color: '#ef4444', fontWeight: 500 }}>
              {subData.total.totalNg !== null ? subData.total.totalNg : ''}
            </td>
          </tr>
        );
      })}

      {/* 수율 - 단일 행 (별도 yield 데이터 사용) */}
      <tr key={`${processKey}-yield`}>
        <td className={styles.rowLabel} colSpan={2} style={{ borderBottom: '2px solid #9ca3af' }}>
          수율(%)
        </td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const yieldValue = yieldDataMap[day];
          return (
            <td
              key={day}
              style={{
                color: '#10b981',
                fontWeight: 600,
                borderBottom: '2px solid #9ca3af',
              }}
            >
              {yieldValue !== null && yieldValue !== undefined
                ? `${yieldValue.toFixed(1)}%`
                : ''}
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
          {processData.yield.total !== null ? `${processData.yield.total}%` : ''}
        </td>
      </tr>
    </React.Fragment>
  );
}
