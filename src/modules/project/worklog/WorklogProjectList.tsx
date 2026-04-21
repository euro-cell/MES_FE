import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/project/worklog/WorklogProjectList.module.css';
import { useProjects } from '../../../hooks/useProjects';
import type { WorklogProject } from './WorklogTypes';

export default function WorklogProjectList() {
  const { data, isLoading, isError } = useProjects();
  const projects: WorklogProject[] = data ?? [];
  const navigate = useNavigate();

  if (isLoading) return <p>데이터를 불러오는 중...</p>;
  if (isError) return <p style={{ color: '#ef4444' }}>서버와 연결할 수 없습니다.</p>;

  return (
    <div className={styles.projectListContainer}>
      <div className={styles.tableWrapper}>
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
    </div>
  );
}
