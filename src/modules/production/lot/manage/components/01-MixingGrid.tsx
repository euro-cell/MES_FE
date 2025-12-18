import { useRef, useEffect, useState } from 'react';
import type { MixingData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/01-MixingGrid.module.css';

interface MixingGridProps {
  data: MixingData[];
}

// tempHumi 문자열에서 온도와 습도를 분리하는 함수
function parseTempHumi(tempHumi: string): { temp: string; humi: string } {
  // "25°C / 50%" 형식 파싱
  const parts = tempHumi.split('/').map(s => s.trim());
  return {
    temp: parts[0] || '-',
    humi: parts[1] || '-',
  };
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
          {data.map(row => {
            const { temp, humi } = parseTempHumi(row.slurry.tempHumi);
            return (
              <tr key={row.id}>
                <td className={`${styles.stickyCol} ${styles.stickyFirst}`}>{row.processDate}</td>
                <td className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>{row.lot}</td>
                <td>{temp}</td>
                <td>{humi}</td>
                <td>{row.slurry.activeMaterialInput}</td>
                <td>{row.slurry.viscosityAfterMixing} cp</td>
                <td>{row.slurry.viscosityAfterDefoaming} cp</td>
                <td>{row.slurry.viscosityAfterStabilization} cp</td>
                <td>{row.slurry.grindGage}</td>
                <td>{row.slurry.solidContent1}%</td>
                <td>{row.slurry.solidContent2}%</td>
                <td>{row.slurry.solidContent3}%</td>
                <td>{row.binder.viscosity !== null ? `${row.binder.viscosity} cp` : '-'}</td>
                <td>{row.binder.solidContent1}%</td>
                <td>{row.binder.solidContent2}%</td>
                <td>{row.binder.solidContent3 !== null ? `${row.binder.solidContent3}%` : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
