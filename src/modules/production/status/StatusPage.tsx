import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import ProductionStatusGrid from './components/ProductionStatusGrid';
import { createCategoryMenus, createMonthMenus, createElectrodeTypeMenus } from './statusConfig';
import { getMonthlyStatusData, getProductionStatusInfo } from './StatusService';
import { parseMonthParam } from './utils/dateUtils';
import type { MonthlyStatusData, ProductionStatusInfo } from './StatusTypes';
import styles from '../../../styles/production/status/StatusPage.module.css';

export default function StatusPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [statusInfo, setStatusInfo] = useState<ProductionStatusInfo | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');
  const electrodeType = searchParams.get('type'); // 'cathode' or 'anode'
  const monthParam = searchParams.get('month'); // "2025-01"

  // 프로젝트 정보 (name, startDate, endDate) 로드
  useEffect(() => {
    const loadStatusInfo = async () => {
      if (!projectId) return;

      try {
        const info = await getProductionStatusInfo(Number(projectId));
        console.log('🚀 ~ statusInfo:', info);
        setStatusInfo(info);
      } catch (err) {
        console.error('생산 현황 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStatusInfo();
  }, [projectId]);

  // 월간 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!category || !monthParam || !projectId) return;

      // 전극 공정인 경우 electrodeType 필수 체크
      if (category === 'Electrode' && !electrodeType) return;

      try {
        const { year, month } = parseMonthParam(monthParam);
        const data = await getMonthlyStatusData(Number(projectId), category, electrodeType, year, month);
        setMonthlyData(data);
      } catch (err) {
        console.error('월간 현황 조회 실패:', err);
      }
    };

    loadData();
  }, [projectId, category, electrodeType, monthParam]);

  if (loading) return <p>데이터를 불러오는 중...</p>;
  if (!statusInfo) return <p>프로젝트를 찾을 수 없습니다.</p>;

  // statusInfo를 project 형태로 변환 (createMonthMenus에서 사용)
  const projectData = {
    id: Number(projectId),
    name: statusInfo.name,
    plan: {
      startDate: statusInfo.startDate,
      endDate: statusInfo.endDate,
    },
  };

  // 메뉴 생성
  const categoryMenus = createCategoryMenus(Number(projectId));
  const monthMenus = category ? createMonthMenus(Number(projectId), category, projectData) : [];
  const electrodeTypeMenus =
    category === 'Electrode' && monthParam ? createElectrodeTypeMenus(Number(projectId), monthParam) : [];

  return (
    <div>
      {/* 프로젝트 헤더 */}
      <div className={styles.projectHeader}>
        <h2>프로젝트: {statusInfo.name}</h2>
        <button className={styles.backButton} onClick={() => navigate('/prod/status')}>
          ← 프로젝트 목록으로
        </button>
      </div>

      {/* 1단계: 카테고리 선택 */}
      <SubmenuBar menus={categoryMenus} />

      {/* 2단계: 월 선택 */}
      {category && (
        <div style={{ marginTop: '10px' }}>
          <SubmenuBar menus={monthMenus} />
        </div>
      )}

      {/* 3단계: 양극/음극 선택 (전극 공정 + 월 선택 후만) */}
      {category === 'Electrode' && monthParam && (
        <div style={{ marginTop: '10px' }}>
          <SubmenuBar menus={electrodeTypeMenus} />
        </div>
      )}

      {/* 생산 현황 그리드 */}
      <div style={{ marginTop: '20px' }}>
        {monthlyData ? (
          <ProductionStatusGrid data={monthlyData} />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            {!category && <p>공정 카테고리를 선택하세요.</p>}
            {category && !monthParam && <p>월을 선택하세요.</p>}
            {category === 'Electrode' && monthParam && !electrodeType && <p>양극/음극을 선택하세요.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
