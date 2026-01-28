import { useState, useEffect } from 'react';
import { getBinderLots, type BinderLot } from '../../../../api/project/worklog';

/**
 * Binder 작업일지 LOT 목록을 로드하는 커스텀 훅
 * @param productionId - 프로젝트(생산) ID
 * @returns lots 목록, lotOptions(드롭다운용), loading, error 상태, getLotSolidContent 함수
 */
export function useBinderLots(productionId?: string | number) {
  const [lots, setLots] = useState<BinderLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLots = async () => {
      if (!productionId) {
        setLots([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getBinderLots(Number(productionId));
        setLots(data);
      } catch (err) {
        console.error('Binder LOT 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('Binder LOT 조회 실패'));
        setLots([]);
      } finally {
        setLoading(false);
      }
    };

    loadLots();
  }, [productionId]);

  // LOT 번호 문자열 배열 (드롭다운용)
  const lotOptions = lots.map(l => l.lotNumber);

  // LOT 번호로 solidContent 값 조회
  const getLotSolidContent = (lotNumber: string): number | null => {
    const lot = lots.find(l => l.lotNumber === lotNumber);
    return lot?.solidContent ?? null;
  };

  return { lots, lotOptions, loading, error, getLotSolidContent };
}
