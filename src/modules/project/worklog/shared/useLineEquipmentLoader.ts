import { useState, useEffect } from 'react';
import { getLineEquipments } from '../../../plant/register/EquipmentService';
import type { Equipment } from '../../../plant/register/EquipmentTypes';
import { LABEL_CATEGORY_MAP, type CategoryLabel } from './processCategories';

/**
 * 라인 선택에 따라 설비 목록을 로드하는 커스텀 훅
 * @param selectedLine - 선택된 라인명 (한글: 전극/조립/화성)
 * @returns plantEquipments - 설비 목록
 */
export function useLineEquipmentLoader(selectedLine?: CategoryLabel | string) {
  const [plantEquipments, setPlantEquipments] = useState<Equipment[]>([]);

  useEffect(() => {
    const loadPlantEquipments = async () => {
      const line = selectedLine as CategoryLabel;
      if (!line || !LABEL_CATEGORY_MAP[line]) {
        setPlantEquipments([]);
        return;
      }
      try {
        const category = LABEL_CATEGORY_MAP[line];
        const equipments = await getLineEquipments(category);
        setPlantEquipments(equipments);
      } catch (err) {
        console.error('설비 목록 조회 실패:', err);
        setPlantEquipments([]);
      }
    };
    loadPlantEquipments();
  }, [selectedLine]);

  return plantEquipments;
}
