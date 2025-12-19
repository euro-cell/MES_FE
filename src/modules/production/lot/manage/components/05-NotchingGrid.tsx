import { useRef, useEffect, useState } from 'react';
import type { NotchingData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/05-NotchingGrid.module.css';

interface NotchingGridProps {
  data: NotchingData[];
}

export default function NotchingGrid({ data }: NotchingGridProps) {
  const firstColRef = useRef<HTMLTableCellElement>(null);
  const [secondColLeft, setSecondColLeft] = useState<number>(0);

  useEffect(() => {
    if (firstColRef.current) {
      const width = firstColRef.current.getBoundingClientRect().width;
      setSecondColLeft(width);
    }
  }, [data]);

  if (data.length === 0) {
    return <div className={styles.noData}>데이터가 없습니다.</div>;
  }

  return (
    <div className={styles.notchingGrid}>
      <table className={styles.notchingTable}>
        <thead>
          {/* 대분류 헤더 (1행) */}
          <tr>
            <th ref={firstColRef} rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyFirst}`}>Date</th>
            <th rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>Lot</th>
            <th colSpan={2} className={styles.groupNotching}>at Notching</th>
            <th colSpan={4} className={styles.groupElectrode}>Electrode Spec.</th>
            <th colSpan={4} className={styles.groupProduction}>Production</th>
          </tr>
          {/* 중분류 헤더 (2행) */}
          <tr>
            <th>Temp</th>
            <th className={styles.groupNotchingEnd}>Humidity</th>
            <th>Over Tab</th>
            <th>Wide</th>
            <th>Length</th>
            <th className={styles.groupElectrodeEnd}>Miss Match</th>
            <th>Total Output</th>
            <th>Defective</th>
            <th>Quantity</th>
            <th>Fraction defective</th>
          </tr>
          {/* 단위 헤더 (3행) */}
          <tr>
            <th>°C</th>
            <th className={styles.groupNotchingEnd}>%</th>
            <th>mm</th>
            <th>mm</th>
            <th>mm</th>
            <th className={styles.groupElectrodeEnd}>&gt;mm</th>
            <th>ea</th>
            <th>ea</th>
            <th>ea</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td className={`${styles.stickyCol} ${styles.stickyFirst} ${styles.groupBasic}`}>{row.notchingDate}</td>
              <td className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond} ${styles.groupBasic}`} style={{ left: secondColLeft }}>{row.lot}</td>
              <td>{row.atNotching.temp}</td>
              <td className={styles.groupNotchingEnd}>{row.atNotching.humidity}</td>
              <td>{row.electrodeSpec.overTab}</td>
              <td>{row.electrodeSpec.wide}</td>
              <td>{row.electrodeSpec.length}</td>
              <td className={styles.groupElectrodeEnd}>{row.electrodeSpec.missMatch}</td>
              <td>{row.production.totalOutput}</td>
              <td>{row.production.defective}</td>
              <td>{row.production.quantity}</td>
              <td>{row.production.fractionDefective}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
