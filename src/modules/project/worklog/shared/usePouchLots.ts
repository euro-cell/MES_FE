import { useState, useEffect } from 'react';
import { getMaterialLots, type MaterialLot } from '../../../../api/material';

/**
 * 파우치 자재 LOT 목록을 로드하는 커스텀 훅
 * Forming 작업일지에서 파우치 LOT 드롭다운에 사용
 * @returns 파우치 LOT 목록, loading, error 상태
 */
export function usePouchLots() {
  const [pouchLots, setPouchLots] = useState<MaterialLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLots = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMaterialLots({ category: '파우치' });
        setPouchLots(data || []);
      } catch (err) {
        console.error('파우치 LOT 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('파우치 LOT 조회 실패'));
        setPouchLots([]);
      } finally {
        setLoading(false);
      }
    };

    loadLots();
  }, []);

  return { pouchLots, loading, error };
}
