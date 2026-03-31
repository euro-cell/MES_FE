import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/project/status/StatusProjectList.module.css';
import { useProjects } from '../../../hooks/useProjects';
import type { StatusProject } from './StatusTypes';

export default function StatusProjectList() {
  const { data, isLoading } = useProjects();
  const projects: StatusProject[] = data ?? [];
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
              <td className={styles.projectName} onClick={() => navigate(`/project/status/${project.id}`)}>
                {project.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
