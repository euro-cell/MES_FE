import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/quality/oqc/OQCProjectList.module.css';
import { getOQCProjects } from '../../../api/quality/OQCService';
import type { OQCProject } from './OQCTypes';

export default function OQCProjectList() {
  const [projects, setProjects] = useState<OQCProject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadProjects = async () => {
    try {
      const data = await getOQCProjects();
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
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td className={styles.projectName} onClick={() => navigate(`/quality/oqc/${project.id}`)}>
                {project.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
