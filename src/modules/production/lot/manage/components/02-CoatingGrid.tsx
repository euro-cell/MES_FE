import { useRef, useEffect, useState } from 'react';
import type { CoatingData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/02-CoatingGrid.module.css';

interface CoatingGridProps {
  data: CoatingData[];
}

export default function CoatingGrid({ data }: CoatingGridProps) {
  const firstColRef = useRef<HTMLTableCellElement>(null);
  const [secondColLeft, setSecondColLeft] = useState<number>(0);

  useEffect(() => {
    if (firstColRef.current) {
      const firstWidth = firstColRef.current.getBoundingClientRect().width;
      setSecondColLeft(firstWidth);
    }
  }, [data]);

  if (data.length === 0) {
    return <div className={styles.noData}>데이터가 없습니다.</div>;
  }

  return (
    <div className={styles.coatingGrid}>
      <table className={styles.coatingTable}>
        <thead>
          {/* 1행: 대분류 헤더 */}
          <tr>
            <th ref={firstColRef} rowSpan={4} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyFirst}`}>Coating Date</th>
            <th rowSpan={4} className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickySecond}`} style={{ left: secondColLeft }}>Lot</th>
            <th colSpan={2} rowSpan={2} className={styles.groupCoating}>at Coating</th>
            <th colSpan={3} rowSpan={2} className={styles.groupElectrode}>Electrode Spec.</th>
            <th colSpan={14} className={styles.groupInspection}>Inspections Data</th>
            <th colSpan={10} rowSpan={2} className={styles.groupDrying}>Drying Conditions</th>
            <th colSpan={3} rowSpan={2} className={styles.groupSlurry}>Slurry Information</th>
            <th colSpan={5} rowSpan={2} className={styles.groupFoil}>Foil Information</th>
          </tr>
          {/* 1-2행: Inspections Data 중분류 */}
          <tr>
            <th colSpan={5} className={styles.groupInspection}>A-Side Coat Weight</th>
            <th colSpan={5} className={styles.groupInspection}>Both Coat Weight</th>
            <th colSpan={3} className={styles.groupInspection}>Both Coat Thickness</th>
            <th className={styles.groupInspection}>Both</th>
          </tr>
          {/* 2행: 중분류 헤더 */}
          <tr>
            {/* Coating Date, Lot은 대분류에서 rowSpan={4} */}
            <th>Temp</th>
            <th className={styles.groupCoatingEnd}>Humidity</th>
            <th>Coat Length</th>
            <th>Coating Width</th>
            <th className={styles.groupElectrodeEnd}>Loading Weight</th>
            {/* A-Side Coat Weight */}
            <th>OP</th>
            <th>Mid</th>
            <th>Gear</th>
            <th>A-Side Web Speed</th>
            <th className={styles.groupSubEnd}>Pump</th>
            {/* Both Coat Weight */}
            <th>OP</th>
            <th>Mid</th>
            <th>Gear</th>
            <th>Both Web Speed</th>
            <th className={styles.groupSubEnd}>Both Pump</th>
            {/* Both Coat Thickness */}
            <th>OP</th>
            <th>Mid</th>
            <th className={styles.groupSubEnd}>Gear</th>
            {/* Both */}
            <th className={styles.groupInspectionEnd}>Misalignment</th>
            {/* Drying Conditions - Temperature */}
            <th colSpan={4} className={styles.groupSubEnd}>Temperature</th>
            <th colSpan={4} className={styles.groupSubEnd}>Supply</th>
            <th colSpan={2} className={styles.groupDryingEnd}>Exhaust</th>
            {/* Slurry Information */}
            <th rowSpan={2}>Lot</th>
            <th>Viscosity</th>
            <th className={styles.groupSlurryEnd}>Solid Content</th>
            {/* Foil Information */}
            <th rowSpan={2}>Lot</th>
            <th rowSpan={2} className={styles.groupFoilTypeEnd}>Type</th>
            <th>Length</th>
            <th>Width</th>
            <th>Thickness</th>
          </tr>
          {/* 3행: 단위 헤더 */}
          <tr>
            {/* Coating Date, Lot은 위에서 rowSpan */}
            <th>°C</th>
            <th className={styles.groupCoatingEnd}>%</th>
            <th>m</th>
            <th>mm</th>
            <th className={styles.groupElectrodeEnd}>mg/cm²</th>
            {/* A-Side Coat Weight */}
            <th>mg/cm²</th>
            <th>mg/cm²</th>
            <th>mg/cm²</th>
            <th>m/min</th>
            <th className={styles.groupSubEnd}>rpm</th>
            {/* Both Coat Weight */}
            <th>mg/cm²</th>
            <th>mg/cm²</th>
            <th>mg/cm²</th>
            <th>m/min</th>
            <th className={styles.groupSubEnd}>rpm</th>
            {/* Both Coat Thickness */}
            <th>μm</th>
            <th>μm</th>
            <th className={styles.groupSubEnd}>μm</th>
            {/* Both */}
            <th className={styles.groupInspectionEnd}>mm</th>
            {/* Temperature */}
            <th>Zone 1</th>
            <th>Zone 2</th>
            <th>Zone 3</th>
            <th className={styles.groupSubEnd}>Zone 4</th>
            {/* Supply */}
            <th>Zone 1</th>
            <th>Zone 2</th>
            <th>Zone 3</th>
            <th className={styles.groupSubEnd}>Zone 4</th>
            {/* Exhaust */}
            <th>Zone 2</th>
            <th className={styles.groupDryingEnd}>Zone 4</th>
            {/* Slurry Information - Lot은 위에서 rowSpan */}
            <th>Cps</th>
            <th className={styles.groupSlurryEnd}>%</th>
            {/* Foil Information - Lot, Type은 위에서 rowSpan */}
            <th>m</th>
            <th>mm</th>
            <th>μm</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <>
              {/* Start (전단) 행 */}
              <tr key={`${row.id}-start`}>
                <td rowSpan={2} className={`${styles.stickyCol} ${styles.stickyFirst}`}>{row.coatingDate}</td>
                <td rowSpan={2} className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond} ${styles.groupBorderRight}`} style={{ left: secondColLeft }}>{row.lot}</td>
                <td rowSpan={2}>{row.atCoating.temp}</td>
                <td rowSpan={2} className={styles.groupCoatingEnd}>{row.atCoating.humidity}</td>
                <td rowSpan={2}>{row.electrodeSpec.coatLength}</td>
                <td rowSpan={2}>{row.electrodeSpec.coatingWidth}</td>
                <td rowSpan={2} className={styles.groupElectrodeEnd}>{row.electrodeSpec.loadingWeight}</td>
                {/* A-Side Coat Weight - Start */}
                <td>{row.inspection.aSideCoatWeight.op.start}</td>
                <td>{row.inspection.aSideCoatWeight.mid.start}</td>
                <td>{row.inspection.aSideCoatWeight.gear.start}</td>
                <td rowSpan={2}>{row.inspection.aSideCoatWeight.webSpeed}</td>
                <td className={styles.groupSubEnd}>{row.inspection.aSideCoatWeight.pump.start}</td>
                {/* Both Coat Weight - Start */}
                <td>{row.inspection.bothCoatWeight.op.start}</td>
                <td>{row.inspection.bothCoatWeight.mid.start}</td>
                <td>{row.inspection.bothCoatWeight.gear.start}</td>
                <td rowSpan={2}>{row.inspection.bothCoatWeight.webSpeed}</td>
                <td rowSpan={2} className={styles.groupSubEnd}>{row.inspection.bothCoatWeight.pump}</td>
                {/* Both Coat Thickness - Start */}
                <td>{row.inspection.bothCoatThickness.op.start}</td>
                <td>{row.inspection.bothCoatThickness.mid.start}</td>
                <td className={styles.groupSubEnd}>{row.inspection.bothCoatThickness.gear.start}</td>
                {/* Both */}
                <td rowSpan={2} className={styles.groupInspectionEnd}>{row.inspection.misalignment}</td>
                {/* Temperature - Zone 1,2 Start */}
                <td>{row.dryingCondition.temperature.zone1.start}</td>
                <td>{row.dryingCondition.temperature.zone2.start}</td>
                <td rowSpan={2}>{row.dryingCondition.temperature.zone3}</td>
                <td rowSpan={2} className={styles.groupSubEnd}>{row.dryingCondition.temperature.zone4}</td>
                {/* Supply - Zone 1,2 Start */}
                <td>{row.dryingCondition.supply.zone1.start}</td>
                <td>{row.dryingCondition.supply.zone2.start}</td>
                <td rowSpan={2}>{row.dryingCondition.supply.zone3}</td>
                <td rowSpan={2} className={styles.groupSubEnd}>{row.dryingCondition.supply.zone4}</td>
                {/* Exhaust */}
                <td rowSpan={2}>{row.dryingCondition.exhaust.zone2}</td>
                <td rowSpan={2} className={styles.groupDryingEnd}>{row.dryingCondition.exhaust.zone4}</td>
                {/* Slurry Information */}
                <td rowSpan={2}>{row.slurryInfo.lot}</td>
                <td rowSpan={2}>{row.slurryInfo.viscosity}</td>
                <td rowSpan={2} className={styles.groupSlurryEnd}>{row.slurryInfo.solidContent}</td>
                {/* Foil Information */}
                <td rowSpan={2}>{row.foilInfo.lot}</td>
                <td rowSpan={2}>{row.foilInfo.type}</td>
                <td rowSpan={2}>{row.foilInfo.length}</td>
                <td rowSpan={2}>{row.foilInfo.width}</td>
                <td rowSpan={2}>{row.foilInfo.thickness}</td>
              </tr>
              {/* End (후단) 행 */}
              <tr key={`${row.id}-end`}>
                {/* A-Side Coat Weight - End */}
                <td>{row.inspection.aSideCoatWeight.op.end}</td>
                <td>{row.inspection.aSideCoatWeight.mid.end}</td>
                <td>{row.inspection.aSideCoatWeight.gear.end}</td>
                <td className={styles.groupSubEnd}>{row.inspection.aSideCoatWeight.pump.end}</td>
                {/* Both Coat Weight - End */}
                <td>{row.inspection.bothCoatWeight.op.end}</td>
                <td>{row.inspection.bothCoatWeight.mid.end}</td>
                <td>{row.inspection.bothCoatWeight.gear.end}</td>
                {/* Both Coat Thickness - End */}
                <td>{row.inspection.bothCoatThickness.op.end}</td>
                <td>{row.inspection.bothCoatThickness.mid.end}</td>
                <td className={styles.groupSubEnd}>{row.inspection.bothCoatThickness.gear.end}</td>
                {/* Temperature - Zone 1,2 End */}
                <td>{row.dryingCondition.temperature.zone1.end}</td>
                <td>{row.dryingCondition.temperature.zone2.end}</td>
                {/* Supply - Zone 1,2 End */}
                <td>{row.dryingCondition.supply.zone1.end}</td>
                <td>{row.dryingCondition.supply.zone2.end}</td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
