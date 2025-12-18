import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../../components/SubmenuBar';
import { createCategoryMenus, createProcessMenus, getProcessById } from '../lotConfig';
import { getProjectInfo } from './LotService';
import type { LotProject } from '../LotTypes';
import styles from '../../../../styles/production/lot/LotPage.module.css';

export default function LotPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [projectInfo, setProjectInfo] = useState<LotProject | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>데이터를 불러오는 중...</p>;
  if (!projectInfo) return <p>프로젝트를 찾을 수 없습니다.</p>;

  // 메뉴 생성
  const categoryMenus = createCategoryMenus(Number(projectId));
  const processMenus = category ? createProcessMenus(Number(projectId), category) : [];

  // 현재 선택된 공정 정보
  const currentProcess = category && process ? getProcessById(category, process) : null;

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

      {/* 안내 메시지 또는 공정 페이지 */}
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

      {/* 공정 선택 시 placeholder */}
      {currentProcess && (
        <div className={styles.placeholder}>
          <p className={styles.processName}>{currentProcess.title}</p>
          <p>Lot 페이지가 준비 중입니다.</p>
        </div>
      )}
    </div>
  );
}
