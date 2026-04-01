import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/quality/lqc/LQCProjectList.module.css';
import { useProjects } from '../../../hooks/useProjects';
import type { LQCProject } from './LQCTypes';

export default function LQCProjectList() {
  const { data, isLoading, isError } = useProjects();
  const projects: LQCProject[] = data ?? [];
  const navigate = useNavigate();

  if (isLoading) return <p>데이터를 불러오는 중...</p>;
  if (isError) return <p style={{ color: '#ef4444' }}>서버와 연결할 수 없습니다.</p>;

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
              <td className={styles.projectName} onClick={() => navigate(`/quality/lqc/${project.id}`)}>
                {project.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
