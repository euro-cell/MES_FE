import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SubmenuBar from '../../../../components/SubmenuBar';
import { fetchCellInventoryStatistics } from '../inOut/InOutService';
import styles from '../../../../styles/moduleIndex.module.css';
import ProjectDetail from './ProjectDetail';
import type { ProjectStatistics } from '../inOut/types';

export default function ProjectIndex() {
  const [projects, setProjects] = useState<ProjectStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchCellInventoryStatistics();
        setProjects(data);
      } catch (err) {
        console.error('프로젝트 목록 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) return <p>데이터를 불러오는 중...</p>;

  // 프로젝트 목록을 메뉴 형식으로 변환
  const projectMenus = projects.map(project => ({
    title: project.projectName,
    path: `/stock/cell/project/${encodeURIComponent(project.projectName)}`,
  }));

  return (
    <div className={styles.modulePage}>
      {projectMenus.length > 0 && <SubmenuBar menus={projectMenus} />}

      <div className='module-content'>
        <Routes>
          <Route
            path='/'
            element={
              <div style={{ padding: '20px' }}>
                <h3>프로젝트별 현황</h3>
                {projectMenus.length === 0 ? (
                  <p>프로젝트가 없습니다.</p>
                ) : (
                  <p>위 메뉴에서 프로젝트를 선택해주세요.</p>
                )}
              </div>
            }
          />
          <Route path='/:projectName' element={<ProjectDetail />} />
        </Routes>
      </div>
    </div>
  );
}
