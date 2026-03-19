import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';
import { calcMean, calcStdev, calcFrequency, calcDensity } from './preFormationCalc';

const DISCHARGE_INTERVAL = 0.2;
const OCV2_INTERVAL = 0.005;

const DISCHARGE_CLASSES = Array.from({ length: 41 }, (_, i) =>
  parseFloat((34 + i * DISCHARGE_INTERVAL).toFixed(1))
);
const OCV2_CLASSES = Array.from({ length: 41 }, (_, i) =>
  parseFloat((2.5 + i * OCV2_INTERVAL).toFixed(3))
);

interface MainFormationNormalDistTableProps {
  dischargeData: number[];
  ocv2Data: number[];
}

function fmtDensity(v: number): string {
  if (v < 0.0001) return v.toExponential(3);
  return v.toFixed(4);
}

export default function MainFormationNormalDistTable({ dischargeData, ocv2Data }: MainFormationNormalDistTableProps) {
  if (dischargeData.length === 0 || ocv2Data.length === 0) return null;

  const dischargeMean = calcMean(dischargeData);
  const dischargeStdev = calcStdev(dischargeData, dischargeMean);
  const ocv2Mean = calcMean(ocv2Data);
  const ocv2Stdev = calcStdev(ocv2Data, ocv2Mean);

  const dischargeFreq = calcFrequency(dischargeData, DISCHARGE_CLASSES);
  const ocv2Freq = calcFrequency(ocv2Data, OCV2_CLASSES);
  const dischargeDensity = calcDensity(DISCHARGE_CLASSES, dischargeMean, dischargeStdev, DISCHARGE_INTERVAL);
  const ocv2Density = calcDensity(OCV2_CLASSES, ocv2Mean, ocv2Stdev, OCV2_INTERVAL);

  const dischargeOther = dischargeData.filter(v => v <= DISCHARGE_CLASSES[0] - DISCHARGE_INTERVAL || v > DISCHARGE_CLASSES[DISCHARGE_CLASSES.length - 1]).length;
  const ocv2Other = ocv2Data.filter(v => v <= OCV2_CLASSES[0] - OCV2_INTERVAL || v > OCV2_CLASSES[OCV2_CLASSES.length - 1]).length;

  return (
    <div className={styles.tableSection}>
      <div style={{ display: 'flex', gap: '48px', marginBottom: '6px', fontSize: 13, color: '#374151' }}>
        <span>
          <strong>MF_Discharge</strong> 　평균: {dischargeMean.toFixed(4)} | 표준편차: {dischargeStdev.toFixed(4)}
        </span>
        <span>
          <strong>OCV2</strong> 　평균: {ocv2Mean.toFixed(4)} | 표준편차: {ocv2Stdev.toFixed(4)}
        </span>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.lqcTable}>
          <thead>
            <tr>
              <th colSpan={3} className={styles.groupBorder}>MF_Discharge 정규분포</th>
              <th colSpan={3} className={styles.groupBorder}>OCV2 정규분포</th>
            </tr>
            <tr>
              <th className={styles.groupBorder}>계급</th>
              <th>빈도수</th>
              <th>확률밀도</th>
              <th className={styles.groupBorder}>계급</th>
              <th>빈도수</th>
              <th>확률밀도</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: DISCHARGE_CLASSES.length }, (_, i) => {
              const dFreq = dischargeFreq[i];
              const oFreq = ocv2Freq[i];
              const highlight = dFreq > 0 || oFreq > 0;
              return (
                <tr key={i} style={highlight ? { backgroundColor: '#dbeafe' } : undefined}>
                  <td className={styles.groupBorder}>{DISCHARGE_CLASSES[i].toFixed(1)}</td>
                  <td>{dFreq}</td>
                  <td>{fmtDensity(dischargeDensity[i])}</td>
                  <td className={styles.groupBorder}>{OCV2_CLASSES[i].toFixed(3)}</td>
                  <td>{oFreq}</td>
                  <td>{fmtDensity(ocv2Density[i])}</td>
                </tr>
              );
            })}
            <tr>
              <td className={styles.groupBorder}>기타</td>
              <td>{dischargeOther}</td>
              <td></td>
              <td className={styles.groupBorder}>기타</td>
              <td>{ocv2Other}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
