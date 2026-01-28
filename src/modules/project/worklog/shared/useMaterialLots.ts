import { useState, useEffect } from 'react';
import { getMaterialLots, type MaterialLot } from '../../../../api/material';

/**
 * 카테고리별 자재 LOT 목록을 로드하는 커스텀 훅
 * @param category - 자재 카테고리 (예: NMP, CMC, SBR)
 * @returns lots 목록, loading, error 상태
 */
export function useMaterialLots(category?: string) {
  const [lots, setLots] = useState<MaterialLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLots = async () => {
      if (!category) {
        setLots([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getMaterialLots({ category });
        setLots(data);
      } catch (err) {
        console.error('자재 LOT 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('자재 LOT 조회 실패'));
        setLots([]);
      } finally {
        setLoading(false);
      }
    };

    loadLots();
  }, [category]);

  // LOT 번호 문자열 배열 (드롭다운용)
  const lotOptions = lots.map(l => l.lot);

  return { lots, lotOptions, loading, error };
}
