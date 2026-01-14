import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../../styles/draw/CellDrawingPage.module.css';
import { getCellDrawingProjects } from './CellDrawingService';
import type { CellDrawingProject } from './CellDrawingTypes';

export default function CellDrawingPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<CellDrawingProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      try {
        const projects = await getCellDrawingProjects();
        const found = projects.find(p => p.id === Number(projectId));
        setProject(found || null);
      } catch (err) {
        console.error('프로젝트 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (loading) return <p>데이터를 불러오는 중...</p>;
  if (!project) return <p>프로젝트를 찾을 수 없습니다.</p>;

  return (
    <div>
      {/* 프로젝트 정보 헤더 */}
      <div className={styles.projectHeader}>
        <h2>프로젝트: {project.name}</h2>
        <button className={styles.backButton} onClick={() => navigate('/draw/cell')}>
          ← 프로젝트 목록으로
        </button>
      </div>

      {/* 셀 도면 컨텐츠 영역 */}
      <div className={styles.content}>
        <div className={styles.placeholder}>셀 도면 내용 준비 중입니다.</div>
      </div>
    </div>
  );
}
