import { useState, useEffect } from 'react';
import { getNotchingLots, type NotchingLotsResponse } from '../../../../api/project/worklog';

/**
 * 노칭 작업일지 LOT 목록을 로드하는 커스텀 훅
 * VD 작업일지에서 양극/음극 매거진 LOT 드롭다운에 사용
 * @param projectId - 프로젝트 ID
 * @returns 양극/음극 LOT 목록, loading, error 상태
 */
export function useNotchingLots(projectId?: string | number) {
  const [cathodeLots, setCathodeLots] = useState<string[]>([]);
  const [anodeLots, setAnodeLots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLots = async () => {
      if (!projectId) {
        setCathodeLots([]);
        setAnodeLots([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data: NotchingLotsResponse = await getNotchingLots(Number(projectId));
        setCathodeLots(data.cathodeLots || []);
        setAnodeLots(data.anodeLots || []);
      } catch (err) {
        console.error('노칭 LOT 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('노칭 LOT 조회 실패'));
        setCathodeLots([]);
        setAnodeLots([]);
      } finally {
        setLoading(false);
      }
    };

    loadLots();
  }, [projectId]);

  return { cathodeLots, anodeLots, loading, error };
}
