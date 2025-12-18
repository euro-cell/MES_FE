import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import DataGrid from './components/DataGrid';
import { createCategoryMenus, createMonthMenus, createElectrodeTypeMenus } from './statusConfig';
import {
  getMonthlyStatusData,
  getRealMonthlyData,
  getProductionStatusInfo,
  updateTargetQuantity,
} from './StatusService';
import { parseMonthParam } from './utils/dateUtils';
import type { MonthlyStatusData, ProductionStatusInfo } from './StatusTypes';
import styles from '../../../styles/production/status/StatusPage.module.css';

// 공정 이름 매핑
const processNameMap: Record<string, string> = {
  mixing: 'Mixing',
  coatingSingle: 'Coating Single',
  coatingDouble: 'Coating Double',
  press: 'Press',
  slitting: 'Slitting',
  notching: 'Notching',
  vd: 'V/D',
  forming: 'Forming',
  stacking: 'Stacking',
  preWelding: 'Pre Welding',
  mainWelding: 'Main Welding',
  sealing: 'Sealing',
  filling: 'E/L Filling',
  preFormation: 'Pre Formation',
  degass: 'Degass',
  mainFormation: 'Main Formation',
  aging: 'Aging',
  grading: 'Grading',
  visualInspection: '외관검사',
};

export default function StatusPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [statusInfo, setStatusInfo] = useState<ProductionStatusInfo | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyStatusData | null>(null);
  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 목표수량 변경 모달 상태
  const [targetModal, setTargetModal] = useState<{
    open: boolean;
    processKey: string;
    subType?: string;
    currentValue: number | null;
  }>({ open: false, processKey: '', currentValue: null });
  const [targetInputValue, setTargetInputValue] = useState('');

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

  // 월간 데이터 로드 (목 데이터)
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

  // 실제 데이터 로드
  useEffect(() => {
    const loadRealData = async () => {
      if (!category || !monthParam || !projectId) return;

      // 전극 공정인 경우 electrodeType 필수 체크
      if (category === 'Electrode' && !electrodeType) return;

      try {
        const { year, month } = parseMonthParam(monthParam);
        const data = await getRealMonthlyData(Number(projectId), category, electrodeType, year, month);
        setRealData(data);
      } catch (err) {
        console.error('실제 데이터 조회 실패:', err);
      }
    };

    loadRealData();
  }, [projectId, category, electrodeType, monthParam]);

  // 실제 데이터 새로고침 함수
  const refreshRealData = async () => {
    if (!category || !monthParam || !projectId) return;
    if (category === 'Electrode' && !electrodeType) return;

    try {
      const { year, month } = parseMonthParam(monthParam);
      const data = await getRealMonthlyData(Number(projectId), category, electrodeType, year, month);
      setRealData(data);
    } catch (err) {
      console.error('실제 데이터 조회 실패:', err);
    }
  };

  // 현재 목표수량 가져오기
  const getCurrentTargetQuantity = (processKey: string, subType?: string): number | null => {
    if (!realData?.processes) return null;
    const processData = realData.processes[processKey];
    if (!processData) return null;

    // VD 공정인 경우
    if (processKey === 'vd' && subType) {
      return processData.total?.[subType]?.targetQuantity ?? null;
    }
    // Forming 공정인 경우
    if (processKey === 'forming') {
      return processData.targetQuantity ?? null;
    }
    // 일반 공정
    return processData.total?.targetQuantity ?? null;
  };

  // 목표수량 변경 버튼 클릭 핸들러
  const handleTargetChangeClick = (processKey: string, subType?: string) => {
    const currentValue = getCurrentTargetQuantity(processKey, subType);
    setTargetModal({ open: true, processKey, subType, currentValue });
    setTargetInputValue(currentValue !== null ? String(currentValue) : '');
  };

  // processKey와 subType을 백엔드 필드명으로 변환
  const buildProcessKeyForBackend = (processKey: string, subType?: string): string => {
    // 양/음극 구분이 있는 공정들
    const electrodeProcesses = ['mixing', 'coatingSingle', 'coatingDouble', 'press', 'slitting', 'notching', 'vd'];

    if (subType && electrodeProcesses.includes(processKey)) {
      // mixing + cathode -> mixingCathode
      const capitalizedSubType = subType.charAt(0).toUpperCase() + subType.slice(1);
      return `${processKey}${capitalizedSubType}`;
    }

    // stacking -> stack (백엔드 필드명과 맞추기)
    if (processKey === 'stacking') {
      return 'stack';
    }

    return processKey;
  };

  // 목표수량 변경 저장
  const handleTargetSave = async () => {
    if (!projectId || !targetInputValue) return;

    const targetQuantity = parseInt(targetInputValue, 10);
    if (isNaN(targetQuantity) || targetQuantity < 0) {
      alert('올바른 수량을 입력해주세요.');
      return;
    }

    try {
      // 전극 공정인 경우 electrodeType도 subType으로 사용
      const subType = targetModal.subType || electrodeType || undefined;
      const processKey = buildProcessKeyForBackend(targetModal.processKey, subType);

      await updateTargetQuantity(Number(projectId), {
        processKey,
        targetQuantity,
      });
      alert('목표수량이 변경되었습니다.');
      setTargetModal({ open: false, processKey: '', currentValue: null });
      // 데이터 새로고침
      await refreshRealData();
    } catch (error) {
      alert('목표수량 변경에 실패했습니다.');
    }
  };

  // 모달 닫기
  const handleTargetCancel = () => {
    setTargetModal({ open: false, processKey: '', currentValue: null });
    setTargetInputValue('');
  };

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

      {/* 안내 메시지 */}
      <div style={{ marginTop: '20px' }}>
        {!monthlyData && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            {!category && <p>공정 카테고리를 선택하세요.</p>}
            {category && !monthParam && <p>월을 선택하세요.</p>}
            {category === 'Electrode' && monthParam && !electrodeType && <p>양극/음극을 선택하세요.</p>}
          </div>
        )}
      </div>

      {/* 실제 데이터 표시 */}
      {realData && monthlyData && (
        <div style={{ marginTop: '40px' }}>
          <DataGrid
            data={realData}
            year={monthlyData.year}
            month={monthlyData.month}
            onTargetChange={handleTargetChangeClick}
          />
        </div>
      )}

      {/* 목표수량 변경 모달 */}
      {targetModal.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleTargetCancel}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              minWidth: '320px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>목표수량 변경</h3>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
              {processNameMap[targetModal.processKey] || targetModal.processKey}
              {targetModal.subType && ` - ${targetModal.subType === 'cathode' ? 'Cathode' : 'Anode'}`}
            </p>
            <p style={{ margin: '0 0 16px 0', color: '#9ca3af', fontSize: '13px' }}>
              현재 값: {targetModal.currentValue !== null ? targetModal.currentValue.toLocaleString() : '-'}
            </p>
            <input
              type='number'
              value={targetInputValue}
              onChange={e => setTargetInputValue(e.target.value)}
              placeholder='새 목표수량 입력'
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '16px',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleTargetCancel}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                취소
              </button>
              <button
                onClick={handleTargetSave}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
