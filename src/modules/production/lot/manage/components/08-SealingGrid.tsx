import { useRef, useEffect, useState } from 'react';
import type { SealingData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/08-SealingGrid.module.css';

interface SealingGridProps {
  data: SealingData[];
}

export default function SealingGrid({ data }: SealingGridProps) {
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
    <div className={styles.sealingGrid}>
      <table className={styles.sealingTable}>
        <thead>
          {/* 대분류 헤더 (1행) */}
          <tr>
            <th ref={firstColRef} rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyFirst}`}>Date</th>
            <th rowSpan={3} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>Lot</th>
            <th colSpan={2} className={styles.groupAssy}>at Ass'y</th>
            <th colSpan={4} className={styles.groupTopSealing}>Top Sealing</th>
            <th colSpan={4} className={styles.groupSideSealing}>Side Sealing</th>
            <th colSpan={2} className={styles.groupFilling}>Filling</th>
            <th className={styles.groupProduction}>Production</th>
          </tr>
          {/* 중분류 헤더 (2행) */}
          <tr>
            <th>Temp</th>
            <th className={styles.groupAssyEnd}>Humidity</th>
            <th>Sealant<br/>돌출높이</th>
            <th>Pouch Sealing<br/>Thickness</th>
            <th>Tab Sealing<br/>Thickness</th>
            <th className={styles.groupTopSealingEnd}>Visual Inspection</th>
            <th>Pouch Sealing<br/>Thickness</th>
            <th>Side/Bottom<br/>Sealing Width</th>
            <th>Visual Inspection</th>
            <th className={styles.groupSideSealingEnd}>IR Check</th>
            <th>주액</th>
            <th className={styles.groupFillingEnd}>LOT</th>
            <th>LOT</th>
          </tr>
          {/* 단위 헤더 (3행) */}
          <tr>
            <th>°C</th>
            <th className={styles.groupAssyEnd}>%</th>
            <th>P/NP</th>
            <th>μm</th>
            <th>μm</th>
            <th className={styles.groupTopSealingEnd}>P/NP</th>
            <th>μm</th>
            <th>P/NP</th>
            <th>P/NP</th>
            <th className={styles.groupSideSealingEnd}>P/NP</th>
            <th>완료 일자</th>
            <th className={styles.groupFillingEnd}>전해액</th>
            <th>Pouch</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td className={`${styles.stickyCol} ${styles.stickyFirst} ${styles.groupBasic}`}>{row.fillingDate}</td>
              <td className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond} ${styles.groupBasic}`} style={{ left: secondColLeft }}>{row.lot}</td>
              <td>{row.atAssy.temp}</td>
              <td className={styles.groupAssyEnd}>{row.atAssy.humidity}</td>
              <td>{row.topSealing.sealantHeight}</td>
              <td>{row.topSealing.pouchSealingThickness}</td>
              <td>{row.topSealing.tabSealingThickness}</td>
              <td className={styles.groupTopSealingEnd}>{row.topSealing.visualInspection}</td>
              <td>{row.sideSealing.pouchSealingThickness}</td>
              <td>{row.sideSealing.sideBottomSealingWidth}</td>
              <td>{row.sideSealing.visualInspection}</td>
              <td className={styles.groupSideSealingEnd}>{row.sideSealing.irCheck}</td>
              <td>{row.filling.injection}</td>
              <td className={styles.groupFillingEnd}>{row.filling.lot}</td>
              <td>{row.production.lot}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
