import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/quality/iqc/IQCPage.module.css';
import { getIQCProject } from '../../../api/quality/IQCService';
import { createIQCMenus } from './menuConfig';
import type { IQCProject, IQCMenuType } from './IQCTypes';
import SummaryTable from './tables/SummaryTable';
import CathodeMaterial1Table from './tables/CathodeMaterial1Table';
import CathodeMaterial2Table from './tables/CathodeMaterial2Table';
import AnodeMaterialTable from './tables/AnodeMaterialTable';
import ConductiveMaterialTable from './tables/ConductiveMaterialTable';
import CurrentCollectorTable from './tables/CurrentCollectorTable';
import SeparatorTable from './tables/SeparatorTable';
import ElectrolyteTable from './tables/ElectrolyteTable';
import PouchTable from './tables/PouchTable';
import LeadTabTable from './tables/LeadTabTable';

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

  const renderContent = () => {
    if (!menu) {
      return <div className={styles.placeholder}>메뉴를 선택하세요.</div>;
    }

    switch (menu) {
      case 'Summary':
        return <SummaryTable />;
      case 'CathodeMaterial1':
        return <CathodeMaterial1Table />;
      case 'CathodeMaterial2':
        return <CathodeMaterial2Table />;
      case 'AnodeMaterial':
        return <AnodeMaterialTable />;
      case 'ConductiveMaterial':
        return <ConductiveMaterialTable />;
      case 'CurrentCollector':
        return <CurrentCollectorTable />;
      case 'Separator':
        return <SeparatorTable />;
      case 'Electrolyte':
        return <ElectrolyteTable />;
      case 'Pouch':
        return <PouchTable />;
      case 'LeadTab':
        return <LeadTabTable />;
      default:
        return <div className={styles.placeholder}>메뉴를 선택하세요.</div>;
    }
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
