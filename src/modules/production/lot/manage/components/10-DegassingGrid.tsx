import { useRef, useEffect, useState } from 'react';
import type { DegassingData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/10-DegassingGrid.module.css';

interface DegassingGridProps {
  data: DegassingData[];
}

export default function DegassingGrid({ data }: DegassingGridProps) {
  const firstColRef = useRef<HTMLTableCellElement>(null);
  const secondColRef = useRef<HTMLTableCellElement>(null);
  const [secondColLeft, setSecondColLeft] = useState<number>(0);
  const [thirdColLeft, setThirdColLeft] = useState<number>(0);

  useEffect(() => {
    if (firstColRef.current && secondColRef.current) {
      const firstWidth = firstColRef.current.getBoundingClientRect().width;
      const secondWidth = secondColRef.current.getBoundingClientRect().width;
      setSecondColLeft(firstWidth);
      setThirdColLeft(firstWidth + secondWidth);
    }
  }, [data]);

  if (data.length === 0) {
    return <div className={styles.noData}>데이터가 없습니다.</div>;
  }

  return (
    <div className={styles.degassingGrid}>
      <table className={styles.degassingTable}>
        <thead>
          {/* 대분류 헤더 (1행) */}
          <tr>
            <th ref={firstColRef} rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyFirst}`}>Date</th>
            <th ref={secondColRef} rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>Ass'y Lot</th>
            <th rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyThird}`} style={{ left: thirdColLeft }}>최종 Lot</th>
            <th colSpan={8} className={styles.groupFormation}>Formation</th>
            <th colSpan={3} className={styles.groupFinalSealing}>Final Sealing</th>
          </tr>
          {/* 중분류 헤더 (2행) */}
          <tr>
            {/* Formation - rowSpan={2}로 단위 행과 병합 */}
            <th rowSpan={2}>Type</th>
            <th rowSpan={2}>Formation_Year</th>
            <th rowSpan={2}>Formation_Month</th>
            <th rowSpan={2}>Formation_Day</th>
            <th rowSpan={2} colSpan={4} className={styles.groupFormationEnd}>Cell No.</th>
            {/* Final Sealing */}
            <th>Pouch Sealing<br/>Thickness</th>
            <th>Side/Bottom<br/>Sealing Width</th>
            <th className={styles.groupFinalSealingEnd}>Visual<br/>Inspection</th>
          </tr>
          {/* 단위 헤더 (3행) */}
          <tr>
            {/* Final Sealing 단위만 */}
            <th>μm</th>
            <th>P/NP</th>
            <th className={styles.groupFinalSealingEnd}>P/NP</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              {/* 기본 정보 */}
              <td className={`${styles.stickyCol} ${styles.stickyFirst} ${styles.groupBasic}`}>{row.date}</td>
              <td className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond} ${styles.groupBasic}`} style={{ left: secondColLeft }}>{row.assyLot}</td>
              <td className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickyThird} ${styles.groupBasic}`} style={{ left: thirdColLeft }}>{row.finalLot}</td>
              {/* Formation */}
              <td>{row.formation.type}</td>
              <td>{row.formation.year}</td>
              <td>{row.formation.month}</td>
              <td>{row.formation.day}</td>
              <td>{row.formation.cellNo[0]}</td>
              <td>{row.formation.cellNo[1]}</td>
              <td>{row.formation.cellNo[2]}</td>
              <td className={styles.groupFormationEnd}>{row.formation.cellNo[3]}</td>
              {/* Final Sealing */}
              <td>{row.finalSealing.pouchSealingThickness}</td>
              <td>{row.finalSealing.sideBottomSealingWidth}</td>
              <td className={styles.groupFinalSealingEnd}>{row.finalSealing.visualInspection}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
