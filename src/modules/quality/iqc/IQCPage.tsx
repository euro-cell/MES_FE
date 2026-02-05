import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/quality/iqc/IQCPage.module.css';
import { getIQCProject, getIQCSummary, getIQCList, getCathodeMaterial1, saveCathodeMaterial1 } from '../../../api/quality/IQCService';
import { createIQCMenus } from './menuConfig';
import type { IQCProject, IQCMenuType, IQCSummary, IQCListItem, CathodeMaterial1Data } from './IQCTypes';
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
  const [summaryData, setSummaryData] = useState<IQCSummary | null>(null);
  const [iqcListData, setIqcListData] = useState<IQCListItem[]>([]);
  const [cathodeMaterial1Data, setCathodeMaterial1Data] = useState<CathodeMaterial1Data | null>(null);

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

  useEffect(() => {
    const loadSummaryData = async () => {
      if (!projectId || menu !== 'Summary') return;

      try {
        const [summary, list] = await Promise.all([
          getIQCSummary(Number(projectId)),
          getIQCList(Number(projectId)),
        ]);
        setSummaryData(summary);
        setIqcListData(list);
      } catch (err) {
        console.error('Summary 데이터 조회 실패:', err);
      }
    };

    loadSummaryData();
  }, [projectId, menu]);

  useEffect(() => {
    const loadCathodeMaterial1Data = async () => {
      if (!projectId || menu !== 'CathodeMaterial1') return;

      try {
        const data = await getCathodeMaterial1(Number(projectId));
        setCathodeMaterial1Data(data);
      } catch (err) {
        console.error('양극재1 데이터 조회 실패:', err);
      }
    };

    loadCathodeMaterial1Data();
  }, [projectId, menu]);

  const handleSaveCathodeMaterial1 = async (data: Partial<CathodeMaterial1Data>) => {
    if (!projectId) return;

    try {
      const saved = await saveCathodeMaterial1(Number(projectId), data);
      setCathodeMaterial1Data(saved);
      alert('저장되었습니다.');
    } catch (err) {
      console.error('양극재1 저장 실패:', err);
      alert('저장에 실패했습니다.');
    }
  };

  if (loading) return <p>데이터를 불러오는 중...</p>;
  if (!project) return <p>프로젝트를 찾을 수 없습니다.</p>;

  const iqcMenus = createIQCMenus(Number(projectId));

  const renderContent = () => {
    if (!menu) {
      return <div className={styles.placeholder}>메뉴를 선택하세요.</div>;
    }

    switch (menu) {
      case 'Summary':
        return (
          <SummaryTable
            data={
              summaryData
                ? {
                    ...summaryData,
                    iqcList: iqcListData,
                  }
                : undefined
            }
          />
        );
      case 'CathodeMaterial1':
        return (
          <CathodeMaterial1Table
            data={cathodeMaterial1Data ?? undefined}
            productionId={Number(projectId)}
            onSave={handleSaveCathodeMaterial1}
          />
        );
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
