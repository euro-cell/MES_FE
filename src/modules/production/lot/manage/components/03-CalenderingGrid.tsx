import { useRef, useEffect, useState } from 'react';
import type { CalenderingData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/03-CalenderingGrid.module.css';

interface CalenderingGridProps {
  data: CalenderingData[];
}

export default function CalenderingGrid({ data }: CalenderingGridProps) {
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
    <div className={styles.calenderingGrid}>
      <table className={styles.calenderingTable}>
        <thead>
          {/* 대분류 헤더 (1행) */}
          <tr>
            <th ref={firstColRef} rowSpan={4} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyFirst}`}>Calendering Date</th>
            <th rowSpan={4} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>Lot</th>
            <th colSpan={2} className={styles.groupCalendering}>at Calendering</th>
            <th colSpan={3} className={styles.groupElectrode}>Electrode Spec.</th>
            <th colSpan={9} className={styles.groupInspection}>Real Inspections</th>
          </tr>
          {/* 중분류 헤더 (2행) */}
          <tr>
            <th rowSpan={2}>Temp</th>
            <th rowSpan={2} className={styles.groupCalenderingEnd}>Humidity</th>
            <th rowSpan={2}>Calendering Length</th>
            <th rowSpan={2}>Pressing Thick</th>
            <th rowSpan={2} className={styles.groupElectrodeEnd}>Loading Weight</th>
            <th rowSpan={2}>Conditions</th>
            <th rowSpan={2}>Pressing Temp</th>
            <th colSpan={3} className={styles.groupSubEnd}>Thickness</th>
            <th colSpan={4}>Coat Weight after Calendering</th>
          </tr>
          {/* 소분류 헤더 (3행) */}
          <tr>
            {/* Temp, Humidity, Calendering Length, Pressing Thick, Loading Weight, Conditions, Pressing Temp은 2행에서 rowSpan */}
            <th>OP</th>
            <th>Mid</th>
            <th className={styles.groupSubEnd}>Gear</th>
            <th>Spec</th>
            <th>P1</th>
            <th>P3</th>
            <th>P4</th>
          </tr>
          {/* 단위 헤더 (4행) */}
          <tr>
            <th>°C</th>
            <th className={styles.groupCalenderingEnd}>%</th>
            <th>m</th>
            <th>μm</th>
            <th className={styles.groupElectrodeEnd}>mg/cm²</th>
            <th>-</th>
            <th>°C</th>
            <th>μm</th>
            <th>μm</th>
            <th className={styles.groupSubEnd}>μm</th>
            <th>mg/cm²</th>
            <th>mg/cm²</th>
            <th>mg/cm²</th>
            <th>mg/cm²</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <>
              {/* 전단 행 */}
              <tr key={`${row.id}-start`}>
                <td rowSpan={2} className={`${styles.stickyCol} ${styles.stickyFirst} ${styles.groupBasic}`}>{row.calenderingDate}</td>
                <td rowSpan={2} className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond} ${styles.groupBasic}`} style={{ left: secondColLeft }}>{row.lot}</td>
                <td rowSpan={2}>{row.atCalendering.temp}</td>
                <td rowSpan={2} className={styles.groupCalenderingEnd}>{row.atCalendering.humidity}</td>
                <td rowSpan={2}>{row.calenderingLen}</td>
                <td rowSpan={2}>{row.electrodeSpec.pressingThick}</td>
                <td rowSpan={2} className={styles.groupElectrodeEnd}>{row.electrodeSpec.loadingWeight}</td>
                <td rowSpan={2}>{row.realInspection.conditions}</td>
                <td rowSpan={2}>{row.realInspection.pressingTemp}</td>
                <td>{row.realInspection.thickness.op.start}</td>
                <td>{row.realInspection.thickness.mid.start}</td>
                <td className={styles.groupSubEnd}>{row.realInspection.thickness.gear.start}</td>
                <td rowSpan={2}>{row.realInspection.coatWeight.spec}</td>
                <td rowSpan={2}>{row.realInspection.coatWeight.p1}</td>
                <td rowSpan={2}>{row.realInspection.coatWeight.p3}</td>
                <td rowSpan={2}>{row.realInspection.coatWeight.p4}</td>
              </tr>
              {/* 후단 행 */}
              <tr key={`${row.id}-end`}>
                <td>{row.realInspection.thickness.op.end}</td>
                <td>{row.realInspection.thickness.mid.end}</td>
                <td className={styles.groupSubEnd}>{row.realInspection.thickness.gear.end}</td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
