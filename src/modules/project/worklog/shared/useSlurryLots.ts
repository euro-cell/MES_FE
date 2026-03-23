import { useState, useEffect } from 'react';
import { getSlurryLots, type SlurryLot } from '../../../../api/project/worklog';

/**
 * 슬러리 작업일지 LOT 목록을 로드하는 커스텀 훅
 * @param projectId - 프로젝트 ID
 * @returns lots 목록, lotOptions, loading, error 상태 및 LOT 정보 조회 함수
 */
export function useSlurryLots(projectId?: string | number) {
  const [lots, setLots] = useState<SlurryLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLots = async () => {
      if (!projectId) {
        setLots([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getSlurryLots(Number(projectId));
        setLots(data);
      } catch (err) {
        console.error('슬러리 LOT 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('슬러리 LOT 조회 실패'));
        setLots([]);
      } finally {
        setLoading(false);
      }
    };

    loadLots();
  }, [projectId]);

  // LOT 번호 문자열 배열 (드롭다운용)
  const lotOptions = lots.map(l => l.lotNumber);

  // LOT 번호로 고형분, 점도 조회
  const getLotInfo = (lotNumber: string): { solidContent: number; viscosity: number } | null => {
    const lot = lots.find(l => l.lotNumber === lotNumber);
    if (!lot) return null;
    return {
      solidContent: lot.solidContent,
      viscosity: lot.viscosity,
    };
  };

  return { lots, lotOptions, loading, error, getLotInfo };
}
