import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/project/worklog/WorklogProjectList.module.css';
import { useProjects } from '../../../hooks/useProjects';
import type { WorklogProject } from './WorklogTypes';

export default function WorklogProjectList() {
  const { data, isLoading } = useProjects();
  const projects: WorklogProject[] = data ?? [];
  const navigate = useNavigate();

  if (isLoading) return <p>데이터를 불러오는 중...</p>;

  return (
    <div className={styles.projectList}>
      <table className={styles.projectTable}>
        <thead>
          <tr>
            <th>프로젝트명</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td className={styles.projectName} onClick={() => navigate(`/project/log/${project.id}`)}>
                {project.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
