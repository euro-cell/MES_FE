import { useState, useEffect } from 'react';
import { getMaterialLots, type MaterialLot } from '../../../../api/material';

/**
 * 테이프 자재 LOT 목록을 로드하는 커스텀 훅
 * Welding 작업일지에서 PI 테이프 LOT 드롭다운에 사용
 * @returns 테이프 LOT 목록, loading, error 상태
 */
export function useTapeLots() {
  const [tapeLots, setTapeLots] = useState<MaterialLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLots = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMaterialLots({ category: '테이프' });
        setTapeLots(data || []);
      } catch (err) {
        console.error('테이프 LOT 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('테이프 LOT 조회 실패'));
        setTapeLots([]);
      } finally {
        setLoading(false);
      }
    };

    loadLots();
  }, []);

  return { tapeLots, loading, error };
}
