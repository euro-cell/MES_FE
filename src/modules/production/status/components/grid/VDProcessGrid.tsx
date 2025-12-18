import React from 'react';
import styles from '../../../../../styles/production/status/ProductionStatusGrid.module.css';
import { PROCESS_NAME_MAP, PROCESS_UNIT_MAP, CHANGE_BUTTON_STYLE } from './constants';
import type { VDProcessData, VDDayData, ProcessGridProps } from './types';

interface VDProcessGridProps extends ProcessGridProps {
  processKey: string;
  processData: VDProcessData;
}

export default function VDProcessGrid({
  processKey,
  processData,
  daysInMonth,
  onTargetChange,
}: VDProcessGridProps) {
  const processName = PROCESS_NAME_MAP[processKey] || processKey;
  const processUnit = PROCESS_UNIT_MAP[processKey] || 'ea';

  // 일별 데이터 매핑
  const dailyDataMap: Record<number, VDDayData> = {};
  processData.data.forEach(item => {
    dailyDataMap[item.day] = item;
  });

  return (
    <React.Fragment>
      {/* 생산량 - Cathode */}
      <tr>
        <td rowSpan={6} className={styles.processHeader}>
          {processName}
        </td>
        <td rowSpan={2} className={styles.rowLabel}>
          생산량({processUnit})
        </td>
        <td className={styles.subTypeLabel}>Cathode</td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return <td key={day}>{dayData?.cathodeOutput || ''}</td>;
        })}
        <td style={{ borderLeft: '2px solid #374151' }}>{processData.total.cathode.totalOutput}</td>
        {/* VD 전체 합계 - Cathode (3행 차지) */}
        <td rowSpan={3}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Cathode</div>
          <div>
            {processData.total.cathode.cumulativeOutput !== null &&
            processData.total.cathode.cumulativeOutput !== undefined
              ? processData.total.cathode.cumulativeOutput.toLocaleString()
              : ''}
          </div>
        </td>
        {/* VD 진행률 - Cathode (3행 차지) */}
        <td rowSpan={3}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Cathode</div>
          <div>
            {processData.total.cathode.progress !== null
              ? `${processData.total.cathode.progress}%`
              : ''}
          </div>
        </td>
        {/* VD 목표수량 - Cathode (3행 차지) */}
        <td rowSpan={3}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Cathode</div>
          <div>
            {processData.total.cathode.targetQuantity !== null
              ? processData.total.cathode.targetQuantity.toLocaleString()
              : ''}
          </div>
          {onTargetChange && (
            <button onClick={() => onTargetChange('vd', 'cathode')} style={CHANGE_BUTTON_STYLE}>
              변경
            </button>
          )}
        </td>
      </tr>
      {/* 생산량 - Anode */}
      <tr>
        <td className={styles.subTypeLabel}>Anode</td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return <td key={day}>{dayData?.anodeOutput || ''}</td>;
        })}
        <td style={{ borderLeft: '2px solid #374151' }}>{processData.total.anode.totalOutput}</td>
      </tr>

      {/* NG - Cathode */}
      <tr>
        <td rowSpan={2} className={styles.rowLabel}>
          NG
        </td>
        <td className={styles.subTypeLabel}>Cathode</td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return (
            <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
              {dayData?.cathodeNg !== null && dayData?.cathodeNg !== undefined
                ? dayData.cathodeNg
                : ''}
            </td>
          );
        })}
        <td style={{ borderLeft: '2px solid #374151', color: '#ef4444', fontWeight: 500 }}>
          {processData.total.cathode.totalNg !== null ? processData.total.cathode.totalNg : ''}
        </td>
      </tr>
      {/* NG - Anode */}
      <tr>
        <td className={styles.subTypeLabel}>Anode</td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return (
            <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
              {dayData?.anodeNg !== null && dayData?.anodeNg !== undefined ? dayData.anodeNg : ''}
            </td>
          );
        })}
        <td style={{ borderLeft: '2px solid #374151', color: '#ef4444', fontWeight: 500 }}>
          {processData.total.anode.totalNg !== null ? processData.total.anode.totalNg : ''}
        </td>
        {/* VD 전체 합계 - Anode (3행 차지) */}
        <td rowSpan={3} style={{ borderBottom: '2px solid #9ca3af' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Anode</div>
          <div>
            {processData.total.anode.cumulativeOutput !== null &&
            processData.total.anode.cumulativeOutput !== undefined
              ? processData.total.anode.cumulativeOutput.toLocaleString()
              : ''}
          </div>
        </td>
        {/* VD 진행률 - Anode (3행 차지) */}
        <td rowSpan={3} style={{ borderBottom: '2px solid #9ca3af' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Anode</div>
          <div>
            {processData.total.anode.progress !== null
              ? `${processData.total.anode.progress}%`
              : ''}
          </div>
        </td>
        {/* VD 목표수량 - Anode (3행 차지) */}
        <td rowSpan={3} style={{ borderBottom: '2px solid #9ca3af' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Anode</div>
          <div>
            {processData.total.anode.targetQuantity !== null
              ? processData.total.anode.targetQuantity.toLocaleString()
              : ''}
          </div>
          {onTargetChange && (
            <button onClick={() => onTargetChange('vd', 'anode')} style={CHANGE_BUTTON_STYLE}>
              변경
            </button>
          )}
        </td>
      </tr>

      {/* 수율 - Cathode */}
      <tr>
        <td rowSpan={2} className={styles.rowLabel} style={{ borderBottom: '2px solid #9ca3af' }}>
          수율(%)
        </td>
        <td className={styles.subTypeLabel}>Cathode</td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return (
            <td key={day} style={{ color: '#10b981', fontWeight: 600 }}>
              {dayData?.cathodeYield !== null && dayData?.cathodeYield !== undefined
                ? `${dayData.cathodeYield.toFixed(1)}%`
                : ''}
            </td>
          );
        })}
        <td style={{ borderLeft: '2px solid #374151', color: '#10b981', fontWeight: 600 }}>
          {processData.total.cathode.totalYield !== null
            ? `${processData.total.cathode.totalYield}%`
            : ''}
        </td>
      </tr>
      {/* 수율 - Anode */}
      <tr>
        <td className={styles.subTypeLabel} style={{ borderBottom: '2px solid #9ca3af' }}>
          Anode
        </td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return (
            <td
              key={day}
              style={{ color: '#10b981', fontWeight: 600, borderBottom: '2px solid #9ca3af' }}
            >
              {dayData?.anodeYield !== null && dayData?.anodeYield !== undefined
                ? `${dayData.anodeYield.toFixed(1)}%`
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
          {processData.total.anode.totalYield !== null
            ? `${processData.total.anode.totalYield}%`
            : ''}
        </td>
      </tr>
    </React.Fragment>
  );
}
