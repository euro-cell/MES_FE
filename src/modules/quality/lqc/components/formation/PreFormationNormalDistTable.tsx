import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';

interface PreFormationNormalDistTableProps {
  chargeData: number[];
  dischargeData: number[];
}

const CLASS_INTERVAL = 0.5;
const CHARGE_CLASSES = Array.from({ length: 41 }, (_, i) => 32 + i * CLASS_INTERVAL);
const DISCHARGE_CLASSES = Array.from({ length: 41 }, (_, i) => 22 + i * CLASS_INTERVAL);

function calcMean(data: number[]): number {
  return data.reduce((a, b) => a + b, 0) / data.length;
}

function calcStdev(data: number[], mean: number): number {
  return Math.sqrt(data.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) / data.length);
}

function calcFrequency(data: number[], classes: number[]): number[] {
  return classes.map((cls, i) => {
    const lower = i === 0 ? -Infinity : classes[i - 1];
    return data.filter(v => v > lower && v <= cls).length;
  });
}

function normalPDF(x: number, mean: number, stdev: number): number {
  return (1 / (stdev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdev, 2));
}

function calcDensity(classes: number[], mean: number, stdev: number): number[] {
  return classes.map(cls => normalPDF(cls, mean, stdev) * CLASS_INTERVAL);
}

function fmtDensity(v: number): string {
  if (v < 0.0001) return v.toExponential(3);
  return v.toFixed(4);
}

export default function PreFormationNormalDistTable({ chargeData, dischargeData }: PreFormationNormalDistTableProps) {
  if (chargeData.length === 0 || dischargeData.length === 0) return null;

  const chargeMean = calcMean(chargeData);
  const chargeStdev = calcStdev(chargeData, chargeMean);
  const dischargeMean = calcMean(dischargeData);
  const dischargeStdev = calcStdev(dischargeData, dischargeMean);

  const chargeFreq = calcFrequency(chargeData, CHARGE_CLASSES);
  const dischargeFreq = calcFrequency(dischargeData, DISCHARGE_CLASSES);
  const chargeDensity = calcDensity(CHARGE_CLASSES, chargeMean, chargeStdev);
  const dischargeDensity = calcDensity(DISCHARGE_CLASSES, dischargeMean, dischargeStdev);

  // 기타 행: 계급 범위 밖 데이터 카운트
  const chargeOther = chargeData.filter(v => v <= CHARGE_CLASSES[0] - CLASS_INTERVAL || v > CHARGE_CLASSES[CHARGE_CLASSES.length - 1]).length;
  const dischargeOther = dischargeData.filter(v => v <= DISCHARGE_CLASSES[0] - CLASS_INTERVAL || v > DISCHARGE_CLASSES[DISCHARGE_CLASSES.length - 1]).length;

  const rowCount = CHARGE_CLASSES.length; // 41

  return (
    <div className={styles.tableSection}>
      <div style={{ display: 'flex', gap: '48px', marginBottom: '6px', fontSize: 13, color: '#374151' }}>
        <span>
          <strong>PF_Charge</strong> 　평균: {chargeMean.toFixed(4)} | 표준편차: {chargeStdev.toFixed(4)}
        </span>
        <span>
          <strong>PF_Discharge</strong> 　평균: {dischargeMean.toFixed(4)} | 표준편차: {dischargeStdev.toFixed(4)}
        </span>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.lqcTable}>
          <thead>
            <tr>
              <th colSpan={3} className={styles.groupBorder}>PF_Charge 정규분포</th>
              <th colSpan={3} className={styles.groupBorder}>PF_Discharge 정규분포</th>
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
            {Array.from({ length: rowCount }, (_, i) => {
              const cFreq = chargeFreq[i];
              const dFreq = dischargeFreq[i];
              const highlight = cFreq > 0 || dFreq > 0;
              return (
                <tr key={i} style={highlight ? { backgroundColor: '#dbeafe' } : undefined}>
                  <td className={styles.groupBorder}>{CHARGE_CLASSES[i].toFixed(1)}</td>
                  <td>{cFreq}</td>
                  <td>{fmtDensity(chargeDensity[i])}</td>
                  <td className={styles.groupBorder}>{DISCHARGE_CLASSES[i].toFixed(1)}</td>
                  <td>{dFreq}</td>
                  <td>{fmtDensity(dischargeDensity[i])}</td>
                </tr>
              );
            })}
            {/* 기타 행 */}
            <tr>
              <td className={styles.groupBorder}>기타</td>
              <td>{chargeOther}</td>
              <td></td>
              <td className={styles.groupBorder}>기타</td>
              <td>{dischargeOther}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
