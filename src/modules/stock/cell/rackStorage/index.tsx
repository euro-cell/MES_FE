import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { RackStorageData } from './types';
import RackStorageGrid from './RackStorageGrid';
import { fetchRackStorageData } from '../../../../api/stock/RackStorageService';
import styles from '../../../../styles/stock/cell/RackStorage.module.css';

export type LegendRange = 'range0' | 'range30' | 'range50' | 'range70' | 'range85' | 'range100';

export const LEGEND_ITEMS: { key: LegendRange; color: string; label: string }[] = [
  { key: 'range0',   color: '#c8e6c9', label: '0-30%' },
  { key: 'range30',  color: '#a5d6a7', label: '30-50%' },
  { key: 'range50',  color: '#ffee58', label: '50-70%' },
  { key: 'range70',  color: '#ffca28', label: '70-85%' },
  { key: 'range85',  color: '#ff7043', label: '85-99%' },
  { key: 'range100', color: '#d32f2f', label: '100%' },
];

export default function RackStorageIndex() {
  const [rackData, setRackData] = useState<RackStorageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [hoveredLegend, setHoveredLegend] = useState<LegendRange | null>(null);

  const loadRackData = async () => {
    setIsLoading(true);
    setFetchError(false);
    try {
      const data = await fetchRackStorageData();
      setRackData(data);
      toast.success('보관 현황이 업데이트 되었습니다.');
    } catch (error) {
      console.error('RACK 데이터 로드 실패:', error);
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRackData();
  }, []);

  return (
    <div className={styles.rackStorageContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>RACK 보관 현황</h3>
          <div className={styles.legendItems}>
            {LEGEND_ITEMS.map(item => (
              <div
                key={item.key}
                className={`${styles.legendItem} ${hoveredLegend === item.key ? styles.legendItemActive : ''}`}
                onMouseEnter={() => setHoveredLegend(item.key)}
                onMouseLeave={() => setHoveredLegend(null)}
              >
                <div className={styles.legendColor} style={{ backgroundColor: item.color }}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.headerRight}>
          {rackData && !isLoading && (
            <p className={styles.updateTime}>마지막 업데이트: {new Date(rackData.updatedAt).toLocaleString('ko-KR')}</p>
          )}
          <button
            className={styles.refreshBtn}
            onClick={loadRackData}
            disabled={isLoading}
            title='보관 현황을 새로고침합니다'
          >
            {isLoading ? '조회 중...' : '🔄 새로고침'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      ) : fetchError ? (
        <div className={styles.loadingContainer}>
          <p style={{ color: '#ef4444' }}>서버와 연결할 수 없습니다.</p>
        </div>
      ) : rackData ? (
        <>
          <RackStorageGrid locations={rackData.locations} hoveredLegend={hoveredLegend} />
          <div className={styles.footer}>
            <p className={styles.updateTime}>마지막 업데이트: {new Date(rackData.updatedAt).toLocaleString('ko-KR')}</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
