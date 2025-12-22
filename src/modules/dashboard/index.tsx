import DashboardContent from './DashboardContent';
import styles from '../../styles/dashboard/layout.module.css';

export default function DashboardIndex() {
  return (
    <div className={styles.dashboardPage}>
      <DashboardContent />
    </div>
  );
}
