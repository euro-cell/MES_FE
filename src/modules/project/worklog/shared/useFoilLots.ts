import { useState, useEffect } from 'react';
import { getMaterialLots, type MaterialLot } from '../../../../api/material';

/**
 * 호일 타입별 LOT 목록을 로드하는 커스텀 훅
 * @param foilType - 호일 타입 (Al Foil, Cu Foil)
 * @returns lots 목록, lotOptions, loading, error 상태 및 LOT 정보 조회 함수
 */
export function useFoilLots(foilType?: string) {
  const [lots, setLots] = useState<MaterialLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLots = async () => {
      if (!foilType) {
        setLots([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getMaterialLots({ type: foilType });
        setLots(data);
      } catch (err) {
        console.error('호일 LOT 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('호일 LOT 조회 실패'));
        setLots([]);
      } finally {
        setLoading(false);
      }
    };

    loadLots();
  }, [foilType]);

  // LOT 번호 문자열 배열 (드롭다운용)
  const lotOptions = lots.map(l => l.lot);

  // LOT 번호로 제조사, 스펙 조회
  const getLotInfo = (lotNumber: string): { manufacturer: string; spec: string } | null => {
    const lot = lots.find(l => l.lot === lotNumber);
    if (!lot) return null;
    return {
      manufacturer: lot.manufacturer ?? '',
      spec: lot.spec ?? '',
    };
  };

  return { lots, lotOptions, loading, error, getLotInfo };
}
