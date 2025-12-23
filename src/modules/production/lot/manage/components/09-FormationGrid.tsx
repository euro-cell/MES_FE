import { useRef, useEffect, useState } from 'react';
import type { FormationData } from '../../LotTypes';
import styles from '../../../../../styles/production/lot/09-FormationGrid.module.css';

interface FormationGridProps {
  data: FormationData[];
}

export default function FormationGrid({ data }: FormationGridProps) {
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
    <div className={styles.formationGrid}>
      <table className={styles.formationTable}>
        <thead>
          {/* 대분류 헤더 (1행) */}
          <tr>
            <th
              ref={firstColRef}
              rowSpan={4}
              className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyFirst}`}
            >
              Date
            </th>
            <th
              ref={secondColRef}
              rowSpan={4}
              className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickySecond}`}
              style={{ left: secondColLeft }}
            >
              Ass'y Lot
            </th>
            <th
              rowSpan={4}
              className={`${styles.headerBasicCol} ${styles.stickyCol} ${styles.stickyThird}`}
              style={{ left: thirdColLeft }}
            >
              Lot
            </th>
            <th rowSpan={2} colSpan={5} className={styles.groupPreFormation}>
              Pre-Formation
            </th>
            <th rowSpan={2} colSpan={3} className={styles.groupFinalSealing}>
              Final Sealing
            </th>
            <th rowSpan={2} colSpan={3} className={styles.groupMainFormation}>
              Main-Formation
            </th>
            <th rowSpan={2} colSpan={2} className={styles.groupOcvIr1}>
              OCV/IR1
            </th>
            <th colSpan={20} className={styles.groupAging}>
              Aging
            </th>
          </tr>
          {/* Aging 중분류 헤더 (2행) */}
          <tr>
            <th colSpan={2} className={styles.groupAging4Days}>
              OCV/IR2 4Days
            </th>
            <th colSpan={3} className={styles.groupAging7Daysㄱ}>
              OCV/IR2 7Days
            </th>
            <th colSpan={10} className={styles.groupGrading}>
              Grading
            </th>
            <th colSpan={3} className={styles.groupSoc}>
              SOC
            </th>
            <th colSpan={2} className={styles.groupOcvIr3}>
              OCV/IR3
            </th>
          </tr>
          {/* 중분류 헤더 (3행) */}
          <tr>
            {/* Pre-Formation */}
            <th>설비</th>
            <th>CH No.</th>
            <th>PFC</th>
            <th>RFD</th>
            <th className={styles.groupPreFormationEnd}>For.EFF_1</th>
            {/* Final Sealing */}
            <th>
              Pouch Sealing
              <br />
              Thickness
            </th>
            <th>
              Side/Bottom
              <br />
              Sealing Width
            </th>
            <th className={styles.groupFinalSealingEnd}>
              Visual
              <br />
              Inspection
            </th>
            {/* Main-Formation */}
            <th>설비</th>
            <th>CH No.</th>
            <th className={styles.groupMainFormationEnd}>MFC</th>
            {/* OCV/IR1 */}
            <th>OCV1</th>
            <th className={styles.groupOcvIr1End}>IR1</th>
            {/* Aging - 4Days */}
            <th>OCV2-4</th>
            <th className={styles.groupAging4DaysEnd}>IR2-4</th>
            {/* Aging - 7Days */}
            <th>OCV2-7</th>
            <th>IR2-7</th>
            <th className={styles.groupAging7DaysEnd}>Delta V</th>
            {/* Grading */}
            <th>설비</th>
            <th>CH No.</th>
            <th>MFD</th>
            <th>Form.EFF_2</th>
            <th>STC</th>
            <th>STD</th>
            <th>Form.EFF_3</th>
            <th>Temp.</th>
            <th>Wh</th>
            <th className={styles.groupGradingEnd}>Nominal V</th>
            {/* SOC */}
            <th>Capacity</th>
            <th>SOC</th>
            <th className={styles.groupSocEnd}>DC-IR</th>
            {/* OCV/IR3 */}
            <th>OCV3</th>
            <th>IR3</th>
          </tr>
          {/* 단위 헤더 (4행) */}
          <tr>
            {/* Pre-Formation */}
            <th>호기</th>
            <th>행/열</th>
            <th>Ah</th>
            <th>Ah</th>
            <th className={styles.groupPreFormationEnd}>%</th>
            {/* Final Sealing */}
            <th>μm</th>
            <th>P/NP</th>
            <th className={styles.groupFinalSealingEnd}>P/NP</th>
            {/* Main-Formation */}
            <th>호기</th>
            <th>행/열</th>
            <th className={styles.groupMainFormationEnd}>Ah</th>
            {/* OCV/IR1 */}
            <th>V</th>
            <th className={styles.groupOcvIr1End}>mΩ</th>
            {/* Aging - 4Days */}
            <th>V</th>
            <th className={styles.groupAging4DaysEnd}>mΩ</th>
            {/* Aging - 7Days */}
            <th>V</th>
            <th>mΩ</th>
            <th className={styles.groupAging7DaysEnd}>mV</th>
            {/* Grading */}
            <th>호기</th>
            <th>행/열</th>
            <th>Ah</th>
            <th>%</th>
            <th>Ah</th>
            <th>Ah</th>
            <th>%</th>
            <th>°C</th>
            <th>Wh</th>
            <th className={styles.groupGradingEnd}>V</th>
            {/* SOC */}
            <th>Ah</th>
            <th>%</th>
            <th className={styles.groupSocEnd}>mΩ</th>
            {/* OCV/IR3 */}
            <th>V</th>
            <th>mΩ</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const rowClassName = row.isDefective ? styles.defective : '';
            return (
              <tr key={row.id} className={rowClassName}>
                {/* 기본 정보 */}
                <td className={`${styles.stickyCol} ${styles.stickyFirst} ${styles.groupBasic}`}>{row.date}</td>
                <td
                  className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickySecond} ${styles.groupBasic}`}
                  style={{ left: secondColLeft }}
                >
                  {row.assyLot}
                </td>
                <td
                  className={`${styles.lotNumber} ${styles.stickyCol} ${styles.stickyThird} ${styles.groupBasic}`}
                  style={{ left: thirdColLeft }}
                >
                  {row.lot}
                </td>
                {/* Pre-Formation */}
                <td>{row.preFormation.equipment}</td>
                <td>{row.preFormation.chNo}</td>
                <td>{row.preFormation.pfc}</td>
                <td>{row.preFormation.rfd}</td>
                <td className={styles.groupPreFormationEnd}>{row.preFormation.forEff1}</td>
                {/* Final Sealing */}
                <td>{row.finalSealing.pouchSealingThickness}</td>
                <td>{row.finalSealing.sideBottomSealingWidth ? 'P' : 'NP'}</td>
                <td className={styles.groupFinalSealingEnd}>{row.finalSealing.visualInspection ? 'P' : 'NP'}</td>
                {/* Main-Formation */}
                <td>{row.mainFormation.equipment}</td>
                <td>{row.mainFormation.chNo}</td>
                <td className={styles.groupMainFormationEnd}>{row.mainFormation.mfc}</td>
                {/* OCV/IR1 */}
                <td>{row.ocvIr1.ocv1}</td>
                <td className={styles.groupOcvIr1End}>{row.ocvIr1.ir1}</td>
                {/* Aging - 4Days */}
                <td>{row.aging4Days.ocv2_4}</td>
                <td className={styles.groupAging4DaysEnd}>{row.aging4Days.ir2_4}</td>
                {/* Aging - 7Days */}
                <td>{row.aging7Days.ocv2_7}</td>
                <td>{row.aging7Days.ir2_7}</td>
                <td className={styles.groupAging7DaysEnd}>{row.aging7Days.deltaV}</td>
                {/* Grading */}
                <td>{row.grading.equipment}</td>
                <td>{row.grading.chNo}</td>
                <td>{row.grading.mfd}</td>
                <td>{row.grading.formEff2}</td>
                <td>{row.grading.stc}</td>
                <td>{row.grading.std}</td>
                <td>{row.grading.formEff3}</td>
                <td>{row.grading.gradingTemp}</td>
                <td>{row.grading.wh}</td>
                <td className={styles.groupGradingEnd}>{row.grading.nominalV}</td>
                {/* SOC */}
                <td>{row.soc.socCapacity}</td>
                <td>{row.soc.soc}</td>
                <td className={styles.groupSocEnd}>{row.soc.dcIr}</td>
                {/* OCV/IR3 */}
                <td>{row.ocvIr3.ocv3}</td>
                <td>{row.ocvIr3.ir3}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
