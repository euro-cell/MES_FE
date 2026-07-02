import React from 'react';
import styles from '../../../../../styles/project/status/ProductionStatusGrid.module.css';
import { PROCESS_NAME_MAP, PROCESS_UNIT_MAP, CHANGE_BUTTON_STYLE, GOOD_CELL_STYLE, GOOD_TOTAL_CELL_STYLE } from './constants';
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

  // 행 순서: 생산량C(1) / 생산량A(2) / 양품C(3) / 양품A(4) / NG C(5) / NG A(6) / 수율C(7) / 수율A(8)
  // Cathode 전체합계: 행1 rowSpan=4 (1~4)
  // Anode 전체합계: 행5 rowSpan=4 (5~8)

  return (
    <React.Fragment>
      {/* 생산량 - Cathode (행1) */}
      <tr>
        <td rowSpan={8} className={styles.processHeader}>
          {processName}
        </td>
        <td rowSpan={2} className={styles.rowLabel}>
          생산량({processUnit})
        </td>
        <td className={styles.subTypeLabel}>Cathode</td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return <td key={day}>{dayData?.cathodeOutput ? dayData.cathodeOutput.toLocaleString() : ''}</td>;
        })}
        <td style={{ borderLeft: '2px solid #374151' }}>{processData.total.cathode.totalOutput.toLocaleString()}</td>
        {/* 전체 합계 - Cathode (행1~4) */}
        <td rowSpan={4}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Cathode</div>
          <div>
            {processData.total.cathode.cumulativeOutput !== null &&
            processData.total.cathode.cumulativeOutput !== undefined
              ? processData.total.cathode.cumulativeOutput.toLocaleString()
              : ''}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            {processData.total.cathode.totalNg !== null
              ? `양품 ${(processData.total.cathode.totalOutput - processData.total.cathode.totalNg).toLocaleString()}`
              : `양품 ${processData.total.cathode.totalOutput.toLocaleString()}`}
          </div>
        </td>
        {/* 진행률 - Cathode (행1~4) */}
        <td rowSpan={4}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Cathode</div>
          <div>
            {processData.total.cathode.progress !== null
              ? `${processData.total.cathode.progress}%`
              : ''}
          </div>
        </td>
        {/* 목표수량 - Cathode (행1~4) */}
        <td rowSpan={4}>
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

      {/* 생산량 - Anode (행2) */}
      <tr>
        <td className={styles.subTypeLabel}>Anode</td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return <td key={day}>{dayData?.anodeOutput ? dayData.anodeOutput.toLocaleString() : ''}</td>;
        })}
        <td style={{ borderLeft: '2px solid #374151' }}>{processData.total.anode.totalOutput.toLocaleString()}</td>
      </tr>

      {/* 양품 - Cathode (행3) */}
      <tr>
        <td rowSpan={2} className={styles.rowLabel}>
          양품
        </td>
        <td className={styles.subTypeLabel}>Cathode</td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          const good =
            dayData?.cathodeOutput !== undefined &&
            dayData?.cathodeNg !== null &&
            dayData?.cathodeNg !== undefined
              ? dayData.cathodeOutput - dayData.cathodeNg
              : dayData?.cathodeOutput
                ? dayData.cathodeOutput
                : null;
          return <td key={day} style={GOOD_CELL_STYLE}>{good !== null ? good.toLocaleString() : ''}</td>;
        })}
        <td style={GOOD_TOTAL_CELL_STYLE}>
          {processData.total.cathode.totalNg !== null
            ? (processData.total.cathode.totalOutput - processData.total.cathode.totalNg).toLocaleString()
            : processData.total.cathode.totalOutput.toLocaleString()}
        </td>
      </tr>

      {/* 양품 - Anode (행4) */}
      <tr>
        <td className={styles.subTypeLabel}>Anode</td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          const good =
            dayData?.anodeOutput !== undefined &&
            dayData?.anodeNg !== null &&
            dayData?.anodeNg !== undefined
              ? dayData.anodeOutput - dayData.anodeNg
              : dayData?.anodeOutput
                ? dayData.anodeOutput
                : null;
          return <td key={day} style={GOOD_CELL_STYLE}>{good !== null ? good.toLocaleString() : ''}</td>;
        })}
        <td style={GOOD_TOTAL_CELL_STYLE}>
          {processData.total.anode.totalNg !== null
            ? (processData.total.anode.totalOutput - processData.total.anode.totalNg).toLocaleString()
            : processData.total.anode.totalOutput.toLocaleString()}
        </td>
      </tr>

      {/* NG - Cathode (행5) */}
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
                ? dayData.cathodeNg.toLocaleString()
                : ''}
            </td>
          );
        })}
        <td style={{ borderLeft: '2px solid #374151', color: '#ef4444', fontWeight: 500 }}>
          {processData.total.cathode.totalNg !== null ? processData.total.cathode.totalNg.toLocaleString() : ''}
        </td>
        {/* 전체 합계 - Anode (행5~8) */}
        <td rowSpan={4} style={{ borderBottom: '2px solid #9ca3af' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Anode</div>
          <div>
            {processData.total.anode.cumulativeOutput !== null &&
            processData.total.anode.cumulativeOutput !== undefined
              ? processData.total.anode.cumulativeOutput.toLocaleString()
              : ''}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            {processData.total.anode.totalNg !== null
              ? `양품 ${(processData.total.anode.totalOutput - processData.total.anode.totalNg).toLocaleString()}`
              : `양품 ${processData.total.anode.totalOutput.toLocaleString()}`}
          </div>
        </td>
        {/* 진행률 - Anode (행5~8) */}
        <td rowSpan={4} style={{ borderBottom: '2px solid #9ca3af' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Anode</div>
          <div>
            {processData.total.anode.progress !== null
              ? `${processData.total.anode.progress}%`
              : ''}
          </div>
        </td>
        {/* 목표수량 - Anode (행5~8) */}
        <td rowSpan={4} style={{ borderBottom: '2px solid #9ca3af' }}>
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

      {/* NG - Anode (행6) */}
      <tr>
        <td className={styles.subTypeLabel}>Anode</td>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = dailyDataMap[day];
          return (
            <td key={day} style={{ color: '#ef4444', fontWeight: 500 }}>
              {dayData?.anodeNg !== null && dayData?.anodeNg !== undefined ? dayData.anodeNg.toLocaleString() : ''}
            </td>
          );
        })}
        <td style={{ borderLeft: '2px solid #374151', color: '#ef4444', fontWeight: 500 }}>
          {processData.total.anode.totalNg !== null ? processData.total.anode.totalNg.toLocaleString() : ''}
        </td>
      </tr>

      {/* 수율 - Cathode (행7) */}
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

      {/* 수율 - Anode (행8) */}
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
