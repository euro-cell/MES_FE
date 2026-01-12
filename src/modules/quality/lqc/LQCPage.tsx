import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/quality/lqc/LQCPage.module.css';
import { getLQCProject } from './LQCService';
import { createCategoryMenus, createProcessMenus } from './processConfig';
import type { LQCProject } from './LQCTypes';

export default function LQCPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [project, setProject] = useState<LQCProject | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');
  const process = searchParams.get('process');

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      try {
        const found = await getLQCProject(Number(projectId));
        setProject(found);
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

  const categoryMenus = createCategoryMenus(Number(projectId));
  const processMenus = category ? createProcessMenus(Number(projectId), category) : [];

  return (
    <div>
      {/* 프로젝트 정보 헤더 */}
      <div className={styles.projectHeader}>
        <h2>프로젝트: {project.name}</h2>
        <button className={styles.backButton} onClick={() => navigate('/quality/lqc')}>
          ← 프로젝트 목록으로
        </button>
      </div>

      {/* 공정 카테고리 탭 메뉴 */}
      <SubmenuBar menus={categoryMenus} />

      {/* 세부 공정 탭 메뉴 */}
      {category && processMenus.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <SubmenuBar menus={processMenus} />
        </div>
      )}

      {/* LQC 컨텐츠 영역 */}
      <div className={styles.content}>
        {!category ? (
          <div className={styles.placeholder}>공정을 선택하세요.</div>
        ) : !process ? (
          <div className={styles.placeholder}>세부 공정을 선택하세요.</div>
        ) : (
          <div className={styles.placeholder}>
            {process} LQC 내용
          </div>
        )}
      </div>
    </div>
  );
}
