import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { RackStorageData } from './types';
import RackStorageGrid from './RackStorageGrid';
import { fetchRackStorageData } from '../../../../api/stock/RackStorageService';
import styles from '../../../../styles/stock/cell/RackStorage.module.css';

export default function RackStorageIndex() {
  const [rackData, setRackData] = useState<RackStorageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadRackData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRackStorageData();
      setRackData(data);
      toast.success('보관 현황이 업데이트 되었습니다.');
    } catch (error) {
      console.error('RACK 데이터 로드 실패:', error);
      toast.error('보관 현황 조회 실패');
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
        <h3 className={styles.title}>RACK 보관 현황</h3>
        <button
          className={styles.refreshBtn}
          onClick={loadRackData}
          disabled={isLoading}
          title='보관 현황을 새로고침합니다'
        >
          {isLoading ? '조회 중...' : '🔄 새로고침'}
        </button>
      </div>

      {rackData ? (
        <>
          <RackStorageGrid locations={rackData.locations} />
          <div className={styles.footer}>
            <p className={styles.updateTime}>마지막 업데이트: {new Date(rackData.updatedAt).toLocaleString('ko-KR')}</p>
          </div>
        </>
      ) : (
        <div className={styles.loadingContainer}>
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      )}
    </div>
  );
}
