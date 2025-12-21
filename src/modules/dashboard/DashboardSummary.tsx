import type { DashboardProject } from './types';
import '../../styles/dashboard/summary.css';

interface Props {
  projects: DashboardProject[];
  onSelectProject: (project: DashboardProject) => void;
}

export default function DashboardSummary({ projects, onSelectProject }: Props) {
  return (
    <div className='dashboard-summary box'>
      <h3>프로젝트 현황</h3>

      <ul className='summary-list registered-list'>
        {projects.length > 0 ? (
          projects.map(p => (
            <li key={p.id} onClick={() => onSelectProject(p)}>
              {p.name}
            </li>
          ))
        ) : (
          <li className='empty'>등록된 프로젝트가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
