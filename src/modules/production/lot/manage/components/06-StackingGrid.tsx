import { useRef, useEffect, useState } from 'react';
import type { StackingData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/06-StackingGrid.module.css';

interface StackingGridProps {
  data: StackingData[];
}

export default function StackingGrid({ data }: StackingGridProps) {
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
    <div className={styles.stackingGrid}>
      <table className={styles.stackingTable}>
        <thead>
          {/* 대분류 헤더 (1행) */}
          <tr>
            <th ref={firstColRef} rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyFirst}`}>Date of production</th>
            <th rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>Lot</th>
            <th colSpan={2} className={styles.groupStacking}>at Stacking</th>
            <th colSpan={5} className={styles.groupJellyroll}>Jellyroll Spec.</th>
            <th colSpan={2} className={styles.groupMagazine}>Magazine</th>
            <th rowSpan={3} className={styles.groupSeparate}>Separate</th>
          </tr>
          {/* 중분류 헤더 (2행) */}
          <tr>
            <th rowSpan={2}>Temp<br/><span className={styles.unit}>°C</span></th>
            <th rowSpan={2} className={styles.groupStackingEnd}>Humidity<br/><span className={styles.unit}>%</span></th>
            <th rowSpan={2}>Stack<br/><span className={styles.unit}>양/음</span></th>
            <th rowSpan={2}>Weight<br/><span className={styles.unit}>P/NP</span></th>
            <th rowSpan={2}>Thickness<br/><span className={styles.unit}>P/NP</span></th>
            <th rowSpan={2}>Alignment (Top/Bottom)<br/><span className={styles.unit}>P/NP</span></th>
            <th rowSpan={2} className={styles.groupJellyrollEnd}>IR<br/><span className={styles.unit}>P/NP</span></th>
            <th rowSpan={2}>Notching (양극)</th>
            <th rowSpan={2} className={styles.groupMagazineEnd}>Notching (음극)</th>
          </tr>
          {/* 단위 헤더 (3행) - 빈 행 (모두 rowSpan으로 병합됨) */}
          <tr>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <>
              {/* 1행 */}
              <tr key={`${row.id}-row1`}>
                <td rowSpan={2} className={`${styles.stickyCol} ${styles.stickyFirst} ${styles.groupBasic}`}>{row.productionDate}</td>
                <td rowSpan={2} className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond} ${styles.groupBasic}`} style={{ left: secondColLeft }}>{row.lot}</td>
                <td rowSpan={2}>{row.atStacking.temp}</td>
                <td rowSpan={2} className={styles.groupStackingEnd}>{row.atStacking.humidity}</td>
                <td rowSpan={2}>{row.jellyrollSpec.stack}</td>
                <td rowSpan={2}>{row.jellyrollSpec.weight}</td>
                <td rowSpan={2}>{row.jellyrollSpec.thickness}</td>
                <td rowSpan={2}>{row.jellyrollSpec.alignment}</td>
                <td rowSpan={2} className={styles.groupJellyrollEnd}>{row.jellyrollSpec.ir}</td>
                <td>{row.magazine.notchingAnode.row1}</td>
                <td className={styles.groupMagazineEnd}>{row.magazine.notchingCathode.row1}</td>
                <td rowSpan={2} className={styles.groupSeparateCell}>{row.magazine.separate}</td>
              </tr>
              {/* 2행 */}
              <tr key={`${row.id}-row2`}>
                <td>{row.magazine.notchingAnode.row2}</td>
                <td className={styles.groupMagazineEnd}>{row.magazine.notchingCathode.row2}</td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
