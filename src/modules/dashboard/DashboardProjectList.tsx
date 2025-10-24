import type { Project } from './types';

interface Props {
  processData: Record<string, { 전극: number; 조립: number; 화성: number }>;
  projects: Project[];
  renderChart: (name: string) => void;
}

export default function DashboardProjectList({ processData, projects, renderChart }: Props) {
  return (
    <div className='project-list box'>
      <h3>프로젝트 현황</h3>
      <ul className='project-list__static'>
        {Object.keys(processData).map(p => (
          <li key={p} onClick={() => renderChart(p)}>
            {p}
          </li>
        ))}
      </ul>
      <ul className='project-list__dynamic'>
        {projects.length > 0 ? (
          projects.map(p => <li key={p.id}>{p.name}</li>)
        ) : (
          <li className='dynamic-project'>등록된 프로젝트가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
