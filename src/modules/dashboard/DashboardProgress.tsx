import type { DashboardProgressData } from './types';
import styles from '../../styles/dashboard/progress.module.css';

interface Props {
  progress: DashboardProgressData;
}

export default function DashboardProgress({ progress }: Props) {
  return (
    <div className={styles.dashboardProgress}>
      <h3>프로젝트 진행률</h3>

      <div className={styles.progressChartWrapper}>
        <div className={styles.chartContainer}>
          <canvas id='processChart'></canvas>
          <div className={styles.chartCenterText} id='chart-center-text'>
            -
          </div>
        </div>

        <div className={styles.processList}>
          <div className={styles.processItem}>
            <span className={styles.label}>전극 공정</span>
            <span className={styles.value}>{progress.electrode}</span>
          </div>
          <div className={styles.processItem}>
            <span className={styles.label}>조립 공정</span>
            <span className={styles.value}>{progress.assembly}</span>
          </div>
          <div className={styles.processItem}>
            <span className={styles.label}>화성 공정</span>
            <span className={styles.value}>{progress.formation}</span>
          </div>
        </div>

        <div className={styles.chartTitle} id='chart-title'>
          프로젝트를 선택하세요
        </div>
      </div>
    </div>
  );
}
