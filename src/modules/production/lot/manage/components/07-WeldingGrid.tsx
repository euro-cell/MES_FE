import { useRef, useEffect, useState } from 'react';
import type { WeldingData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/07-WeldingGrid.module.css';

interface WeldingGridProps {
  data: WeldingData[];
}

export default function WeldingGrid({ data }: WeldingGridProps) {
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
    <div className={styles.weldingGrid}>
      <table className={styles.weldingTable}>
        <thead>
          {/* 대분류 헤더 (1행) */}
          <tr>
            <th ref={firstColRef} rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyFirst}`}>Welding Date</th>
            <th rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>Lot</th>
            <th colSpan={2} className={styles.groupWelding}>at Welding</th>
            <th colSpan={2} className={styles.groupPreWelding}>Pre Welding</th>
            <th colSpan={3} className={styles.groupMainWelding}>Main Welding</th>
          </tr>
          {/* 중분류 헤더 (2행) */}
          <tr>
            <th>Temp</th>
            <th className={styles.groupWeldingEnd}>Humidity</th>
            <th>Welding Position</th>
            <th className={styles.groupPreWeldingEnd}>Trim Position</th>
            <th>Welding Position</th>
            <th>IR Check</th>
            <th>Taping</th>
          </tr>
          {/* 단위 헤더 (3행) */}
          <tr>
            <th>°C</th>
            <th className={styles.groupWeldingEnd}>%</th>
            <th>P/N</th>
            <th className={styles.groupPreWeldingEnd}>P/N</th>
            <th>P/N</th>
            <th>P/N</th>
            <th>P/N</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td className={`${styles.stickyCol} ${styles.stickyFirst} ${styles.groupBasic}`}>{row.weldingDate}</td>
              <td className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond} ${styles.groupBasic}`} style={{ left: secondColLeft }}>{row.lot}</td>
              <td>{row.atWelding.temp}</td>
              <td className={styles.groupWeldingEnd}>{row.atWelding.humidity}</td>
              <td>{row.preWelding.weldingPosition}</td>
              <td className={styles.groupPreWeldingEnd}>{row.preWelding.trimPosition}</td>
              <td>{row.mainWelding.weldingPosition}</td>
              <td>{row.mainWelding.irCheck}</td>
              <td>{row.mainWelding.taping}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
