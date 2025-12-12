import type { DashboardProject, DashboardProcessRaw } from './types';
import '../../styles/dashboard/summary.css';

interface Props {
  processData: Record<string, DashboardProcessRaw>;
  projects: DashboardProject[];
  onSelectProject: (name: string) => void;
}

export default function DashboardSummary({ processData, projects, onSelectProject }: Props) {
  return (
    <div className='dashboard-summary box'>
      <h3>프로젝트 현황</h3>

      <ul className='summary-list sample-list'>
        {Object.keys(processData).map(p => (
          <li key={p} onClick={() => onSelectProject(p)}>
            {p}
          </li>
        ))}
      </ul>
      <ul className='summary-list registered-list'>
        {projects.length > 0 ? (
          projects.map(p => <li key={p.id}>{p.name}</li>)
        ) : (
          <li className='empty'>등록된 프로젝트가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
