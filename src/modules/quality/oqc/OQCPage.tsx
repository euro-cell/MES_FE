import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/quality/oqc/OQCPage.module.css';
import { getOQCProject } from '../../../api/quality/OQCService';
import { createOQCMenus } from './processConfig';
import SummaryTable from './components/SummaryTable';
import GradingTable from './components/grading/GradingTable';
import AppearanceTable from './components/AppearanceTable';
import DimensionTable from './components/DimensionTable';
import WeightTable from './components/WeightTable';
import type { OQCProject } from './OQCTypes';

export default function OQCPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [project, setProject] = useState<OQCProject | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const menu = searchParams.get('menu');

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      try {
        const found = await getOQCProject(Number(projectId));
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

  const oqcMenus = createOQCMenus(Number(projectId));

  return (
    <div>
      {/* 프로젝트 정보 헤더 */}
      <div className={styles.projectHeader}>
        <h2>프로젝트: {project.name}</h2>
        <button className={styles.backButton} onClick={() => navigate('/quality/oqc')}>
          ← 프로젝트 목록으로
        </button>
      </div>

      {/* OQC 하위 메뉴 */}
      <SubmenuBar menus={oqcMenus} />

      {/* OQC 컨텐츠 영역 */}
      <div className={styles.content}>
        {!menu ? (
          <div className={styles.placeholder}>메뉴를 선택하세요.</div>
        ) : menu === 'Summary' ? (
          <SummaryTable projectId={Number(projectId)} />
        ) : menu === 'Grading' ? (
          <GradingTable projectId={Number(projectId)} />
        ) : menu === 'Appearance' ? (
          <AppearanceTable projectId={Number(projectId)} />
        ) : menu === 'Dimension' ? (
          <DimensionTable projectId={Number(projectId)} />
        ) : menu === 'Weight' ? (
          <WeightTable projectId={Number(projectId)} />
        ) : (
          <div className={styles.placeholder}>{menu} 내용</div>
        )}
      </div>
    </div>
  );
}
