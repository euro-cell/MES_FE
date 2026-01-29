import { useState, useEffect } from 'react';
import { getMaterialsByCategory, getMaterialLots, type MaterialLot } from '../../../../api/material';

interface Material {
  id: number;
  category: string;
  type: string;
  name: string;
  company: string;
  unit: string;
}

/**
 * 리드탭 자재 타입 및 LOT 목록을 로드하는 커스텀 훅
 * Welding 작업일지에서 리드탭 타입/LOT 드롭다운에 사용
 * @param selectedType1 - 선택된 리드탭1 타입 (해당 타입의 LOT만 조회)
 * @param selectedType2 - 선택된 리드탭2 타입 (해당 타입의 LOT만 조회)
 * @returns 리드탭 타입 목록, LOT 목록, loading, error 상태
 */
export function useLeadTabLots(selectedType1?: string, selectedType2?: string) {
  const [leadTabTypes, setLeadTabTypes] = useState<string[]>([]);
  const [leadTab1Lots, setLeadTab1Lots] = useState<MaterialLot[]>([]);
  const [leadTab2Lots, setLeadTab2Lots] = useState<MaterialLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 리드탭 타입 목록 조회
  useEffect(() => {
    const loadTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const materials = await getMaterialsByCategory('리드탭');
        // 중복 제거하여 타입 목록 생성
        const types = [...new Set(materials.map((m: Material) => m.type))];
        setLeadTabTypes(types);
      } catch (err) {
        console.error('리드탭 타입 조회 실패:', err);
        setError(err instanceof Error ? err : new Error('리드탭 타입 조회 실패'));
        setLeadTabTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadTypes();
  }, []);

  // 리드탭1 LOT 목록 조회 (선택된 타입에 따라)
  useEffect(() => {
    const loadLots = async () => {
      if (!selectedType1) {
        setLeadTab1Lots([]);
        return;
      }

      try {
        const data = await getMaterialLots({ category: '리드탭', type: selectedType1 });
        setLeadTab1Lots(data || []);
      } catch (err) {
        console.error('리드탭1 LOT 조회 실패:', err);
        setLeadTab1Lots([]);
      }
    };

    loadLots();
  }, [selectedType1]);

  // 리드탭2 LOT 목록 조회 (선택된 타입에 따라)
  useEffect(() => {
    const loadLots = async () => {
      if (!selectedType2) {
        setLeadTab2Lots([]);
        return;
      }

      try {
        const data = await getMaterialLots({ category: '리드탭', type: selectedType2 });
        setLeadTab2Lots(data || []);
      } catch (err) {
        console.error('리드탭2 LOT 조회 실패:', err);
        setLeadTab2Lots([]);
      }
    };

    loadLots();
  }, [selectedType2]);

  return { leadTabTypes, leadTab1Lots, leadTab2Lots, loading, error };
}
