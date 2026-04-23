import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../../../../api/axiosInstance';
import NCRStatusTable from './NCRStatusTable';
import NCRDetailSection from './NCRDetailSection';
import type { NCRStatisticsResponse } from './types';
import styles from '../../../../styles/stock/cell/NCRStatus.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function NCRStatus() {
  const [statisticsData, setStatisticsData] = useState<NCRStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 NCR 통계 데이터 로드
  const loadStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<NCRStatisticsResponse>(`${API_BASE}/cell-inventory/ncr/statistics`, {
        withCredentials: true,
      });
      setStatisticsData(response.data);
      toast.success('NCR 통계가 조회되었습니다.');
    } catch (err: any) {
      console.error('NCR 통계 조회 실패:', err);
      setError('서버와 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadStatistics();
  }, []);

  if (loading) {
    return (
      <div className={styles.ncrContainer}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !statisticsData) {
    return (
      <div className={styles.ncrContainer}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
          <p>{error}</p>
          <button
            onClick={loadStatistics}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ncrContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>NCR 세부 구분 현황</h3>
        <button
          className={styles.refreshBtn}
          onClick={loadStatistics}
          disabled={loading}
          title='NCR 통계를 새로고침합니다'
        >
          {loading ? '조회 중...' : '🔄 새로고침'}
        </button>
      </div>

      <div className={styles.splitLayout}>
        {/* 좌측 - NCR 현황표 (40%) */}
        <div className={styles.leftPanel}>
          <NCRStatusTable items={statisticsData.data} projects={statisticsData.projects} />
        </div>

        {/* 우측 - NCR 세부내역 (60%) */}
        <div className={styles.rightPanel}>
          <NCRDetailSection />
        </div>
      </div>
    </div>
  );
}
