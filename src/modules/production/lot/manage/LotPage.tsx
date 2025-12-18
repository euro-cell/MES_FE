import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../../components/SubmenuBar';
import { createCategoryMenus, createProcessMenus, getProcessById } from '../lotConfig';
import { getProjectInfo, getMixingData, syncLotData, getSyncStatus } from './LotService';
import type { LotProject, MixingData } from '../LotTypes';
import MixingGrid from './components/01-MixingGrid';
import styles from '../../../../styles/production/lot/LotPage.module.css';

// 상대 시간 포맷 함수
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

export default function LotPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [projectInfo, setProjectInfo] = useState<LotProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [mixingData, setMixingData] = useState<MixingData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // 공정 선택 시 자동으로 데이터 로드
  useEffect(() => {
    const loadProcessData = async () => {
      if (!projectId || !process) return;

      setIsRefreshing(true);
      try {
        // Sync 상태 조회
        const syncStatus = await getSyncStatus(Number(projectId), process);
        if (syncStatus?.syncedAt) {
          setLastUpdated(new Date(syncStatus.syncedAt));
        }

        // 데이터 조회
        if (process === 'Mixing') {
          const data = await getMixingData(Number(projectId));
          setMixingData(data);
        }
        // TODO: 다른 공정 데이터 로드 추가
      } catch (err) {
        console.error('데이터 조회 실패:', err);
      } finally {
        setIsRefreshing(false);
      }
    };

    loadProcessData();
  }, [projectId, process]);

  // 데이터 갱신 핸들러 (버튼 클릭 시)
  const handleRefresh = async () => {
    if (!projectId || !process) return;

    setIsRefreshing(true);
    try {
      // 먼저 동기화 API 호출
      await syncLotData(Number(projectId), process);

      // 동기화 후 Sync 상태 조회
      const syncStatus = await getSyncStatus(Number(projectId), process);
      if (syncStatus?.syncedAt) {
        setLastUpdated(new Date(syncStatus.syncedAt));
      }

      // 데이터 다시 조회
      if (process === 'Mixing') {
        const data = await getMixingData(Number(projectId));
        setMixingData(data);
      }
      // TODO: 다른 공정 데이터 로드 추가
    } catch (err) {
      console.error('데이터 갱신 실패:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

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

      {/* 메뉴 + 갱신 버튼 영역 */}
      <div className={styles.menuRow}>
        <div className={styles.menuGroup}>
          {/* 1단계: 카테고리 선택 */}
          <SubmenuBar menus={categoryMenus} />

          {/* 2단계: 공정 선택 (카테고리 선택 후) */}
          {category && (
            <div className={styles.menuSection}>
              <SubmenuBar menus={processMenus} />
            </div>
          )}
        </div>

        {/* 갱신 버튼 */}
        {currentProcess && (
          <div className={styles.refreshSection}>
            <button
              className={styles.refreshButton}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                '갱신 중...'
              ) : (
                <>
                  <svg
                    className={styles.refreshIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                  </svg>
                  데이터 갱신
                </>
              )}
            </button>
            <span className={styles.lastUpdated}>
              최근 업데이트 : {lastUpdated ? formatRelativeTime(lastUpdated) : '없음'}
            </span>
          </div>
        )}
      </div>

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
