import type { DashboardProject } from './types';
import styles from '../../styles/dashboard/summary.module.css';

interface Props {
  projects: DashboardProject[];
  onSelectProject: (project: DashboardProject) => void;
  hasError?: boolean;
}

export default function DashboardSummary({ projects, onSelectProject, hasError }: Props) {
  return (
    <div className={styles.dashboardSummary}>
      <h3>프로젝트 현황</h3>

      <ul className={`${styles.summaryList} ${styles.registeredList}`}>
        {hasError ? (
          <li className={styles.empty} style={{ color: '#ef4444' }}>서버와 연결할 수 없습니다.</li>
        ) : projects.length > 0 ? (
          projects.map(p => (
            <li key={p.id} onClick={() => onSelectProject(p)}>
              {p.name}
            </li>
          ))
        ) : (
          <li className={styles.empty}>등록된 프로젝트가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
