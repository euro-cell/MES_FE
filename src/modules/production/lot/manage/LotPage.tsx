import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../../components/SubmenuBar';
import { createCategoryMenus, createProcessMenus, getProcessById } from '../lotConfig';
import { getProjectInfo, getMixingData } from './LotService';
import type { LotProject, MixingData } from '../LotTypes';
import MixingGrid from './components/01-MixingGrid';
import styles from '../../../../styles/production/lot/LotPage.module.css';

export default function LotPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [projectInfo, setProjectInfo] = useState<LotProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [mixingData, setMixingData] = useState<MixingData[]>([]);

  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');
  const process = searchParams.get('process');

  // 프로젝트 정보 로드
  useEffect(() => {
    const loadProjectInfo = async () => {
      if (!projectId) return;

      try {
        const info = await getProjectInfo(Number(projectId));
        setProjectInfo(info);
      } catch (err) {
        console.error('프로젝트 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjectInfo();
  }, [projectId]);

  // Mixing 데이터 로드
  useEffect(() => {
    const loadMixingData = async () => {
      if (!projectId || process !== 'Mixing') return;

      try {
        const data = await getMixingData(Number(projectId));
        setMixingData(data);
      } catch (err) {
        console.error('Mixing 데이터 조회 실패:', err);
      }
    };

    loadMixingData();
  }, [projectId, process]);

  if (loading) return <p>데이터를 불러오는 중...</p>;
  if (!projectInfo) return <p>프로젝트를 찾을 수 없습니다.</p>;

  // 메뉴 생성
  const categoryMenus = createCategoryMenus(Number(projectId));
  const processMenus = category ? createProcessMenus(Number(projectId), category) : [];

  // 현재 선택된 공정 정보
  const currentProcess = category && process ? getProcessById(category, process) : null;

  // 공정별 컴포넌트 렌더링
  const renderProcessContent = () => {
    if (!currentProcess) return null;

    switch (process) {
      case 'Mixing':
        return <MixingGrid data={mixingData} />;
      default:
        return (
          <div className={styles.placeholder}>
            <p className={styles.processName}>{currentProcess.title}</p>
            <p>Lot 페이지가 준비 중입니다.</p>
          </div>
        );
    }
  };

  return (
    <div>
      {/* 프로젝트 헤더 */}
      <div className={styles.projectHeader}>
        <h2>프로젝트: {projectInfo.name}</h2>
        <button className={styles.backButton} onClick={() => navigate('/prod/lot')}>
          ← 프로젝트 목록으로
        </button>
      </div>

      {/* 1단계: 카테고리 선택 */}
      <SubmenuBar menus={categoryMenus} />

      {/* 2단계: 공정 선택 (카테고리 선택 후) */}
      {category && (
        <div className={styles.menuSection}>
          <SubmenuBar menus={processMenus} />
        </div>
      )}

      {/* 안내 메시지 */}
      {!category && (
        <div className={styles.guideMessage}>
          <p>공정 카테고리를 선택하세요.</p>
        </div>
      )}

      {category && !process && (
        <div className={styles.guideMessage}>
          <p>공정을 선택하세요.</p>
        </div>
      )}

      {/* 공정별 컨텐츠 */}
      {currentProcess && <div style={{ marginTop: '20px' }}>{renderProcessContent()}</div>}
    </div>
  );
}
