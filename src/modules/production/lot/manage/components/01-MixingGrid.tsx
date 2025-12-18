import { useRef, useEffect, useState } from 'react';
import type { MixingData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/01-MixingGrid.module.css';

interface MixingGridProps {
  data: MixingData[];
}

export default function MixingGrid({ data }: MixingGridProps) {
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
    <div className={styles.mixingGrid}>
      <table className={styles.mixingTable}>
        <thead>
          {/* 그룹 헤더 */}
          <tr>
            <th ref={firstColRef} className={`${styles.groupBasic} ${styles.stickyCol} ${styles.stickyFirst}`}></th>
            <th className={`${styles.groupBasic} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}></th>
            <th colSpan={2} className={styles.groupMixing}>at Mixing</th>
            <th colSpan={1} className={styles.groupInput}>INPUT</th>
            <th colSpan={3} className={styles.groupViscosity}>Viscosity</th>
            <th colSpan={4} className={styles.groupElectrode}>Electrode Spec.</th>
            <th colSpan={4} className={styles.groupBinder}>Binder</th>
          </tr>
          {/* 컬럼 헤더 (중) */}
          <tr>
            <th className={`${styles.stickyCol} ${styles.stickyFirst}`}>Mixing Date</th>
            <th className={`${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>Lot</th>
            <th>Temp</th>
            <th>Humidity</th>
            <th>Active Material</th>
            <th>After Mixing</th>
            <th>탈포 후</th>
            <th>안정화 후</th>
            <th>Grind Gage</th>
            <th colSpan={3}>solid content</th>
            <th>viscosity</th>
            <th colSpan={3}>solid content</th>
          </tr>
          {/* 단위 헤더 */}
          <tr>
            <th className={`${styles.stickyCol} ${styles.stickyFirst}`}></th>
            <th className={`${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}></th>
            <th>°C</th>
            <th>%</th>
            <th>kg</th>
            <th>CPS</th>
            <th>CPS</th>
            <th>CPS</th>
            <th>μm</th>
            <th>%</th>
            <th>%</th>
            <th>%</th>
            <th>CPS</th>
            <th>%</th>
            <th>%</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td className={`${styles.stickyCol} ${styles.stickyFirst}`}>{row.mixingDate}</td>
              <td className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>{row.lotNumber}</td>
              <td>{row.temp}</td>
              <td>{row.humidity}%</td>
              <td>{row.activeMaterial}</td>
              <td>{row.viscosityAfterMixing} cp</td>
              <td>{row.viscosityAfterDefoam} cp</td>
              <td>{row.viscosityAfterStable} cp</td>
              <td>{row.grindGage}</td>
              <td>{row.solidContent1}%</td>
              <td>{row.solidContent2}%</td>
              <td>{row.solidContent3}%</td>
              <td>{row.binderViscosity !== null ? `${row.binderViscosity} cp` : '-'}</td>
              <td>{row.binderSolidContent1}%</td>
              <td>{row.binderSolidContent2}%</td>
              <td>{row.binderSolidContent3 !== undefined ? `${row.binderSolidContent3}%` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
