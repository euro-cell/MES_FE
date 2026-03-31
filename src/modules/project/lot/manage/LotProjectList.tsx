import { useNavigate } from 'react-router-dom';
import styles from '../../../../styles/project/lot/LotProjectList.module.css';
import { useProjects } from '../../../../hooks/useProjects';
import type { LotProject } from '../LotTypes';

export default function LotProjectList() {
  const { data, isLoading } = useProjects();
  const projects: LotProject[] = data ?? [];
  const navigate = useNavigate();

  if (isLoading) return <p>데이터를 불러오는 중...</p>;

  return (
    <div className={styles.projectList}>
      <table className={styles.projectTable}>
        <thead>
          <tr>
            <th>프로젝트명</th>
            <th>시작일</th>
            <th>종료일</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td className={styles.projectName} onClick={() => navigate(`/project/lot/${project.id}`)}>
                {project.name}
              </td>
              <td>{project.startDate || '-'}</td>
              <td>{project.endDate || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
