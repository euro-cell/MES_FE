import { useState, useEffect } from 'react';
import { getMaterialLots, type MaterialLot } from '../../../../api/material';

/**
 * 전해액 자재 LOT 목록을 로드하는 커스텀 훅
 * Filling 작업일지에서 전해액 LOT 드롭다운에 사용
 * @returns 전해액 LOT 목록, loading, error 상태
 */
export function useElectrolyteLots() {
  const [electrolyteLots, setElectrolyteLots] = useState<MaterialLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLots = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMaterialLots({ category: '전해액' });
        setElectrolyteLots(data || []);
      } catch (err) {
        console.error('전해액 LOT 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('전해액 LOT 조회 실패'));
        setElectrolyteLots([]);
      } finally {
        setLoading(false);
      }
    };

    loadLots();
  }, []);

  return { electrolyteLots, loading, error };
}
