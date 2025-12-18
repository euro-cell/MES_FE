import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../../../styles/production/lot/LotProjectList.module.css';
import { getLotProjects } from './LotService';
import type { LotProject } from '../LotTypes';

export default function LotProjectList() {
  const [projects, setProjects] = useState<LotProject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadProjects = async () => {
    try {
      const data = await getLotProjects();
      setProjects(data);
    } catch (err) {
      console.error('프로젝트 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) return <p>데이터를 불러오는 중...</p>;

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
              <td className={styles.projectName} onClick={() => navigate(`/prod/lot/${project.id}`)}>
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
