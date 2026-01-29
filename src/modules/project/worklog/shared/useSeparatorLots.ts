import { useState, useEffect } from 'react';
import { getMaterialLots, type MaterialLot } from '../../../../api/material';

/**
 * 분리막 자재 LOT 목록을 로드하는 커스텀 훅
 * Stacking 작업일지에서 분리막 LOT 드롭다운에 사용
 * @returns 분리막 LOT 목록, loading, error 상태
 */
export function useSeparatorLots() {
  const [separatorLots, setSeparatorLots] = useState<MaterialLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLots = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMaterialLots({ category: '분리막' });
        setSeparatorLots(data || []);
      } catch (err) {
        console.error('분리막 LOT 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('분리막 LOT 조회 실패'));
        setSeparatorLots([]);
      } finally {
        setLoading(false);
      }
    };

    loadLots();
  }, []);

  return { separatorLots, loading, error };
}
