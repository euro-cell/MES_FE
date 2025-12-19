import { useRef, useEffect, useState } from 'react';
import type { SlittingData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/04-SlittingGrid.module.css';

interface SlittingGridProps {
  data: SlittingData[];
}

export default function SlittingGrid({ data }: SlittingGridProps) {
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
    <div className={styles.slittingGrid}>
      <table className={styles.slittingTable}>
        <thead>
          {/* 대분류 헤더 (1행) */}
          <tr>
            <th ref={firstColRef} rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyFirst}`}>Slitting Date</th>
            <th rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>Lot</th>
            <th colSpan={2} className={styles.groupSlitting}>at Slitting</th>
            <th colSpan={2} className={styles.groupElectrode}>Electrode Spec.</th>
          </tr>
          {/* 중분류 헤더 (2행) */}
          <tr>
            <th>Temp</th>
            <th className={styles.groupSlittingEnd}>Humidity</th>
            <th>Slitting Length</th>
            <th>Slitting Width</th>
          </tr>
          {/* 단위 헤더 (3행) */}
          <tr>
            <th>°C</th>
            <th className={styles.groupSlittingEnd}>%</th>
            <th>m</th>
            <th>mm</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td className={`${styles.stickyCol} ${styles.stickyFirst} ${styles.groupBasic}`}>{row.slittingDate}</td>
              <td className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond} ${styles.groupBasic}`} style={{ left: secondColLeft }}>{row.lot}</td>
              <td>{row.atSlitting.temp}</td>
              <td className={styles.groupSlittingEnd}>{row.atSlitting.humidity}</td>
              <td>{row.slittingLength}</td>
              <td>{row.slittingWidth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
