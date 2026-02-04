import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/quality/iqc/IQCPage.module.css';
import { getIQCProject } from '../../../api/quality/IQCService';
import { createIQCMenus } from './menuConfig';
import type { IQCProject, IQCMenuType } from './IQCTypes';

export default function IQCPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [project, setProject] = useState<IQCProject | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const menu = searchParams.get('menu') as IQCMenuType | null;

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      try {
        const found = await getIQCProject(Number(projectId));
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

  const iqcMenus = createIQCMenus(Number(projectId));

  // 메뉴별 한글 타이틀 매핑
  const menuTitles: Record<IQCMenuType, string> = {
    Summary: 'Summary',
    CathodeMaterial1: '양극재1',
    CathodeMaterial2: '양극재2',
    AnodeMaterial: '음극재',
    ConductiveMaterial: '도전재',
    CurrentCollector: '집전체',
    Separator: '분리막',
    Electrolyte: '전해액',
    Pouch: '파우치',
    LeadTab: '리드탭',
  };

  const renderContent = () => {
    if (!menu) {
      return <div className={styles.placeholder}>메뉴를 선택하세요.</div>;
    }

    const menuTitle = menuTitles[menu] || menu;

    // TODO: 각 메뉴별 컴포넌트 구현 후 교체
    return (
      <div className={styles.placeholder}>
        {menuTitle} - 준비 중입니다.
      </div>
    );
  };

  return (
    <div>
      {/* 프로젝트 정보 헤더 */}
      <div className={styles.projectHeader}>
        <h2>프로젝트: {project.name}</h2>
        <button className={styles.backButton} onClick={() => navigate('/quality/iqc')}>
          ← 프로젝트 목록으로
        </button>
      </div>

      {/* IQC 하위 메뉴 */}
      <SubmenuBar menus={iqcMenus} />

      {/* IQC 컨텐츠 영역 */}
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
}
