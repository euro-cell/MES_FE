import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { useMaterialLots } from '../../shared/useMaterialLots';
import { useBinderLots } from '../../shared/useBinderLots';
import { useProjectSpecification } from '../../shared/useProjectSpecification';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { SLURRY_NUMERIC_FIELDS } from '../../shared/numericFields';
import { createSlurryWorklog } from '../../../../../api/project/worklog';
import type { SlurryWorklogPayload } from './SlurryTypes';
import {
  SLURRY_TIME_FIELDS,
  SLURRY_MULTILINE_FIELDS,
  SLURRY_READONLY_FIELDS,
  MATERIAL_FIELD_SUFFIXES,
} from './slurryConstants';
import {
  saveWorklogDefaults,
  loadWorklogDefaults,
  saveWorklogAllFields,
  loadWorklogAllFields,
} from '../../shared/worklogDefaults';
import toast from 'react-hot-toast';
import { getMixerEquipments } from '../../../../../api/plant/EquipmentService';
import type { Equipment } from '../../../../plant/register/EquipmentTypes';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

// 라인명 고정 옵션
const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

// 양극재/음극재 선택 옵션
const ELECTRODE_TYPE_OPTIONS = ['양극재', '음극재'];

export default function SlurryRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('slurry');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { specification } = useProjectSpecification(projectId);

  // 자재 1~6에 대한 LOT 목록 조회
  const { lotOptions: material1LotOptions } = useMaterialLots(formValues.material1Name);
  const { lotOptions: material2LotOptions } = useMaterialLots(formValues.material2Name);
  const { lotOptions: material3LotOptions } = useMaterialLots(formValues.material3Name);
  const { lotOptions: material4LotOptions } = useMaterialLots(formValues.material4Name);
  const { lotOptions: material5LotOptions } = useMaterialLots(formValues.material5Name);
  const { lotOptions: material6LotOptions } = useMaterialLots(formValues.material6Name);
  // 바인더용액 LOT 목록 조회 (Binder 작업일지에서)
  const { lotOptions: binderSolutionLotOptions } = useBinderLots(projectId);

  const [saving, setSaving] = useState(false);
  const [mixerEquipments, setMixerEquipments] = useState<Equipment[]>([]);
  // 설계정보에서 가져온 자재 수 (동적 readOnly 계산용)
  const [activeMaterialCount, setActiveMaterialCount] = useState(0);
  // 양극재/음극재(activeMaterial) 행 수 - 이 행까지는 투입량설계 입력 가능
  const [electrodeMaterialCount, setElectrodeMaterialCount] = useState(0);

  // 동적 readOnly 필드 계산: 설계정보에서 가져온 자재 수에 따라 사용하지 않는 행은 전체 readOnly
  const dynamicReadOnlyFields = useMemo(() => {
    const fields: string[] = [...SLURRY_READONLY_FIELDS];

    // 1~6행 조성(%)은 항상 readOnly (설계정보에서 자동 채움)
    for (let i = 1; i <= 6; i++) {
      fields.push(`material${i}Composition`);
    }

    // 2~6행 구분(Name)은 항상 readOnly (설계정보에서 자동 채움)
    for (let i = 2; i <= 6; i++) {
      fields.push(`material${i}Name`);
    }

    // 양극재/음극재 행 이후의 투입량설계(PlannedInput)는 readOnly (자동 계산)
    // electrodeMaterialCount+1 ~ 6행이 자동 계산 대상
    if (electrodeMaterialCount > 0) {
      for (let i = electrodeMaterialCount + 1; i <= 6; i++) {
        fields.push(`material${i}PlannedInput`);
      }
    }

    // 사용하지 않는 행 (activeMaterialCount + 1 ~ 6)은 모든 필드가 readOnly
    if (activeMaterialCount > 0) {
      for (let i = activeMaterialCount + 1; i <= 6; i++) {
        MATERIAL_FIELD_SUFFIXES.forEach(suffix => {
          const fieldName = `material${i}${suffix}`;
          if (!fields.includes(fieldName)) {
            fields.push(fieldName);
          }
        });
      }
    }

    return fields;
  }, [activeMaterialCount, electrodeMaterialCount]);

  // 자동계산 필드 툴팁 생성
  const fieldTooltips = useMemo(() => {
    const tips: Record<string, string> = {
      // 고형분 자동계산
      solidContent1Percentage: '= (고형분1 Dry중량 - 고형분1 Dish중량) / (고형분1 Slurry중량 - 고형분1 Dish중량) × 100',
      solidContent2Percentage: '= (고형분2 Dry중량 - 고형분2 Dish중량) / (고형분2 Slurry중량 - 고형분2 Dish중량) × 100',
      solidContent3Percentage: '= (고형분3 Dry중량 - 고형분3 Dish중량) / (고형분3 Slurry중량 - 고형분3 Dish중량) × 100',
      // PD Mixer 1 자동계산
      pdMixer1Input1: '= 바인더 투입량설계 × 투입율1',
      pdMixer1Input2: '= 도전재1 투입량설계 × 투입율2',
      pdMixer1Input3: '= 도전재2 투입량설계 × 투입율3',
      pdMixer1Input4: '= 활물질1 투입량설계 × 투입율4',
      pdMixer1Input5: '= 활물질2 투입량설계 × 투입율5',
      pdMixer1Input6: '= 용매 추가량설계 × 투입율6',
      pdMixer1SolidContent1: '= SUM(투입량1 × Binder Solution) / SUM(투입량1)',
      pdMixer1SolidContent2: '= (투입량1 × Binder Solution + 투입량2) / (투입량1 + 투입량2)',
      pdMixer1SolidContent3: '= (투입량1 × Binder Solution + 투입량2 + 투입량3) / (투입량1~3)',
      pdMixer1SolidContent4: '= (투입량1 × Binder Solution + 투입량2~4) / (투입량1~4)',
      pdMixer1SolidContent5: '= (투입량1 × Binder Solution + 투입량2~5) / (투입량1~5)',
      pdMixer1SolidContent6: '= (투입량1 × Binder Solution + 투입량2~5) / (투입량1~6)',
      // PD Mixer 2 자동계산
      pdMixer2Input1: '= 용매 추가량설계 × PD Mixer 2 투입율1',
      pdMixer2SolidContent1: '= (PD1투입량1 × Binder Solution + PD1투입량2~5) / (PD1투입량1~6 + PD2투입량1)',
      // 용매 자동계산
      solventTotalPlannedInput: '= 원료1 투입량설계 / 원료1 조성(%) / Solid Content - 원료1 투입량설계 / 원료1 조성(%)',
      solventAddPlannedInput: '= 용매 총량설계 - 바인더 투입량설계 × (1 - Binder Solution)',
    };

    // 자재투입정보 조성(%) - 설계정보에서 자동 채움
    for (let i = 1; i <= 6; i++) {
      tips[`material${i}Composition`] = '설계정보에서 자동으로 채워집니다';
    }

    // 2~6행 구분(Name) - 설계정보에서 자동 채움
    for (let i = 2; i <= 6; i++) {
      tips[`material${i}Name`] = '설계정보에서 자동으로 채워집니다';
    }

    // 도전재/바인더 투입량설계 자동계산 (electrodeMaterialCount 이후 행)
    if (electrodeMaterialCount > 0) {
      for (let i = electrodeMaterialCount + 1; i <= 6; i++) {
        const materialName = formValues[`material${i}Name`];
        if (materialName === '바인더') {
          tips[`material${i}PlannedInput`] =
            `= 원료1 투입량설계 / 원료1 조성(%) × 원료${i} 조성(%) / Binder Solution`;
        } else if (materialName === '도전재') {
          tips[`material${i}PlannedInput`] =
            `= 원료1 투입량설계 / 원료1 조성(%) × 원료${i} 조성(%)`;
        }
      }
    }

    return tips;
  }, [electrodeMaterialCount, formValues]);

  // 수식 참조 정보 (호버 시 셀 하이라이트용)
  const formulaRefs = useMemo(() => {
    const COLORS = {
      blue: '#2196F3',
      green: '#4CAF50',
      orange: '#FF9800',
      purple: '#9C27B0',
    };

    const refs: Record<string, { formula: string; refs: { field: string; label: string; color: string }[] }> = {
      // 고형분 자동계산
      solidContent1Percentage: {
        formula: '= (Dry중량 - Dish중량) / (Slurry중량 - Dish중량) × 100',
        refs: [
          { field: 'solidContent1Dry', label: 'Dry중량', color: COLORS.blue },
          { field: 'solidContent1Dish', label: 'Dish중량', color: COLORS.green },
          { field: 'solidContent1Slurry', label: 'Slurry중량', color: COLORS.orange },
        ],
      },
      solidContent2Percentage: {
        formula: '= (Dry중량 - Dish중량) / (Slurry중량 - Dish중량) × 100',
        refs: [
          { field: 'solidContent2Dry', label: 'Dry중량', color: COLORS.blue },
          { field: 'solidContent2Dish', label: 'Dish중량', color: COLORS.green },
          { field: 'solidContent2Slurry', label: 'Slurry중량', color: COLORS.orange },
        ],
      },
      solidContent3Percentage: {
        formula: '= (Dry중량 - Dish중량) / (Slurry중량 - Dish중량) × 100',
        refs: [
          { field: 'solidContent3Dry', label: 'Dry중량', color: COLORS.blue },
          { field: 'solidContent3Dish', label: 'Dish중량', color: COLORS.green },
          { field: 'solidContent3Slurry', label: 'Slurry중량', color: COLORS.orange },
        ],
      },
      // PD Mixer 1 자동계산 - 기본값 (바인더/도전재/활물질 행을 찾기 전)
      pdMixer1Input1: {
        formula: '= 바인더 투입량설계 × 투입율1',
        refs: [
          { field: 'pdMixer1InputRate1', label: '투입율1', color: COLORS.green },
        ],
      },
      pdMixer1Input2: {
        formula: '= 도전재1 투입량설계 × 투입율2',
        refs: [
          { field: 'pdMixer1InputRate2', label: '투입율2', color: COLORS.green },
        ],
      },
      pdMixer1Input3: {
        formula: '= 도전재2 투입량설계 × 투입율3',
        refs: [
          { field: 'pdMixer1InputRate3', label: '투입율3', color: COLORS.green },
        ],
      },
      pdMixer1Input4: {
        formula: '= 활물질1 투입량설계 × 투입율4',
        refs: [
          { field: 'pdMixer1InputRate4', label: '투입율4', color: COLORS.green },
        ],
      },
      pdMixer1Input5: {
        formula: '= 활물질2 투입량설계 × 투입율5',
        refs: [
          { field: 'pdMixer1InputRate5', label: '투입율5', color: COLORS.green },
        ],
      },
      pdMixer1Input6: {
        formula: '= 용매 추가량설계 × 투입율6',
        refs: [
          { field: 'solventAddPlannedInput', label: '용매 추가량설계', color: COLORS.blue },
          { field: 'pdMixer1InputRate6', label: '투입율6', color: COLORS.green },
        ],
      },
      pdMixer1SolidContent1: {
        formula: '= SUM(투입량1 × Binder Solution) / SUM(투입량1)',
        refs: [
          { field: 'pdMixer1Input1', label: '투입량1', color: COLORS.blue },
          { field: 'binderSolution', label: 'Binder Solution', color: COLORS.green },
        ],
      },
      pdMixer1SolidContent2: {
        formula: '= (투입량1 × Binder Solution + 투입량2) / (투입량1 + 투입량2)',
        refs: [
          { field: 'pdMixer1Input1', label: '투입량1', color: COLORS.blue },
          { field: 'binderSolution', label: 'Binder Solution', color: COLORS.green },
          { field: 'pdMixer1Input2', label: '투입량2', color: COLORS.orange },
        ],
      },
      pdMixer1SolidContent3: {
        formula: '= (투입량1 × Binder Solution + 투입량2 + 투입량3) / (투입량1~3)',
        refs: [
          { field: 'pdMixer1Input1', label: '투입량1', color: COLORS.blue },
          { field: 'binderSolution', label: 'Binder Solution', color: COLORS.green },
          { field: 'pdMixer1Input2', label: '투입량2', color: COLORS.orange },
          { field: 'pdMixer1Input3', label: '투입량3', color: COLORS.purple },
        ],
      },
      pdMixer1SolidContent4: {
        formula: '= (투입량1 × Binder Solution + 투입량2~4) / (투입량1~4)',
        refs: [
          { field: 'pdMixer1Input1', label: '투입량1', color: COLORS.blue },
          { field: 'binderSolution', label: 'Binder Solution', color: COLORS.green },
          { field: 'pdMixer1Input4', label: '투입량4', color: COLORS.orange },
        ],
      },
      pdMixer1SolidContent5: {
        formula: '= (투입량1 × Binder Solution + 투입량2~5) / (투입량1~5)',
        refs: [
          { field: 'pdMixer1Input1', label: '투입량1', color: COLORS.blue },
          { field: 'binderSolution', label: 'Binder Solution', color: COLORS.green },
          { field: 'pdMixer1Input5', label: '투입량5', color: COLORS.orange },
        ],
      },
      pdMixer1SolidContent6: {
        formula: '= (투입량1 × Binder Solution + 투입량2~5) / (투입량1~6)',
        refs: [
          { field: 'pdMixer1Input1', label: '투입량1', color: COLORS.blue },
          { field: 'binderSolution', label: 'Binder Solution', color: COLORS.green },
          { field: 'pdMixer1Input6', label: '투입량6', color: COLORS.orange },
        ],
      },
      // PD Mixer 2 자동계산
      pdMixer2Input1: {
        formula: '= 용매 추가량설계 × PD Mixer 2 투입율1',
        refs: [
          { field: 'solventAddPlannedInput', label: '용매 추가량설계', color: COLORS.blue },
          { field: 'pdMixer2InputRate1', label: 'PD Mixer 2 투입율1', color: COLORS.green },
        ],
      },
      pdMixer2SolidContent1: {
        formula: '= (PD1투입량1 × Binder Solution + PD1투입량2~5) / (PD1투입량1~6 + PD2투입량1)',
        refs: [
          { field: 'pdMixer1Input1', label: 'PD1투입량1', color: COLORS.blue },
          { field: 'binderSolution', label: 'Binder Solution', color: COLORS.green },
          { field: 'pdMixer2Input1', label: 'PD2투입량1', color: COLORS.orange },
        ],
      },
      // 용매 총량 자동계산
      solventTotalPlannedInput: {
        formula: '= 원료1 투입량설계 / 원료1 조성(%) / Solid Content - 원료1 투입량설계 / 원료1 조성(%)',
        refs: [
          { field: 'material1PlannedInput', label: '원료1 투입량설계', color: COLORS.blue },
          { field: 'material1Composition', label: '원료1 조성(%)', color: COLORS.green },
          { field: 'solidContent', label: 'Solid Content', color: COLORS.orange },
        ],
      },
    };

    // 바인더/도전재/활물질 행 번호 찾기
    let binderRowNum = 0;
    const conductorRowNums: number[] = [];
    const electrodeRowNums: number[] = [];
    for (let i = 1; i <= 6; i++) {
      const materialName = formValues[`material${i}Name`];
      if (materialName === '바인더') {
        binderRowNum = i;
      } else if (materialName === '도전재') {
        conductorRowNums.push(i);
      } else if (materialName === '양극재' || materialName === '음극재') {
        electrodeRowNums.push(i);
      }
    }

    // 바인더 행이 있으면 동적 수식 참조 추가
    if (binderRowNum > 0) {
      // pdMixer1Input1 수식 참조에 바인더 투입량설계 추가
      refs.pdMixer1Input1 = {
        formula: '= 바인더 투입량설계 × 투입율1',
        refs: [
          { field: `material${binderRowNum}PlannedInput`, label: '바인더 투입량설계', color: COLORS.blue },
          { field: 'pdMixer1InputRate1', label: '투입율1', color: COLORS.green },
        ],
      };

      // 용매 추가량 자동계산
      refs.solventAddPlannedInput = {
        formula: `= 용매 총량설계 - 바인더 투입량설계 × (1 - Binder Solution)`,
        refs: [
          { field: 'solventTotalPlannedInput', label: '용매 총량설계', color: COLORS.blue },
          { field: `material${binderRowNum}PlannedInput`, label: '바인더 투입량설계', color: COLORS.green },
          { field: 'binderSolution', label: 'Binder Solution', color: COLORS.orange },
        ],
      };
    }

    // 도전재1 행이 있으면 pdMixer1Input2 수식 참조 추가
    if (conductorRowNums[0]) {
      refs.pdMixer1Input2 = {
        formula: '= 도전재1 투입량설계 × 투입율2',
        refs: [
          { field: `material${conductorRowNums[0]}PlannedInput`, label: '도전재1 투입량설계', color: COLORS.blue },
          { field: 'pdMixer1InputRate2', label: '투입율2', color: COLORS.green },
        ],
      };
    }

    // 도전재2 행이 있으면 pdMixer1Input3 수식 참조 추가
    if (conductorRowNums[1]) {
      refs.pdMixer1Input3 = {
        formula: '= 도전재2 투입량설계 × 투입율3',
        refs: [
          { field: `material${conductorRowNums[1]}PlannedInput`, label: '도전재2 투입량설계', color: COLORS.blue },
          { field: 'pdMixer1InputRate3', label: '투입율3', color: COLORS.green },
        ],
      };
    }

    // 활물질1 행이 있으면 pdMixer1Input4 수식 참조 추가
    if (electrodeRowNums[0]) {
      refs.pdMixer1Input4 = {
        formula: '= 활물질1 투입량설계 × 투입율4',
        refs: [
          { field: `material${electrodeRowNums[0]}PlannedInput`, label: '활물질1 투입량설계', color: COLORS.blue },
          { field: 'pdMixer1InputRate4', label: '투입율4', color: COLORS.green },
        ],
      };
    }

    // 활물질2 행이 있으면 pdMixer1Input5 수식 참조 추가
    if (electrodeRowNums[1]) {
      refs.pdMixer1Input5 = {
        formula: '= 활물질2 투입량설계 × 투입율5',
        refs: [
          { field: `material${electrodeRowNums[1]}PlannedInput`, label: '활물질2 투입량설계', color: COLORS.blue },
          { field: 'pdMixer1InputRate5', label: '투입율5', color: COLORS.green },
        ],
      };
    }

    // 도전재2 행이 있으면 pdMixer1Input3 수식 참조 추가
    if (conductorRowNums[1]) {
      refs.pdMixer1Input3 = {
        formula: '= 도전재2 투입량설계 × 투입율3',
        refs: [
          { field: `material${conductorRowNums[1]}PlannedInput`, label: '도전재2 투입량설계', color: COLORS.blue },
          { field: 'pdMixer1InputRate3', label: '투입율3', color: COLORS.green },
        ],
      };
    }

    // 도전재/바인더 투입량설계 자동계산
    if (electrodeMaterialCount > 0) {
      for (let i = electrodeMaterialCount + 1; i <= 6; i++) {
        const materialName = formValues[`material${i}Name`];
        if (materialName === '바인더') {
          refs[`material${i}PlannedInput`] = {
            formula: `= 원료1 투입량설계 / 원료1 조성(%) × 원료${i} 조성(%) / Binder Solution`,
            refs: [
              { field: 'material1PlannedInput', label: '원료1 투입량설계', color: COLORS.blue },
              { field: 'material1Composition', label: '원료1 조성(%)', color: COLORS.green },
              { field: `material${i}Composition`, label: `원료${i} 조성(%)`, color: COLORS.orange },
              { field: 'binderSolution', label: 'Binder Solution', color: COLORS.purple },
            ],
          };
        } else if (materialName === '도전재') {
          refs[`material${i}PlannedInput`] = {
            formula: `= 원료1 투입량설계 / 원료1 조성(%) × 원료${i} 조성(%)`,
            refs: [
              { field: 'material1PlannedInput', label: '원료1 투입량설계', color: COLORS.blue },
              { field: 'material1Composition', label: '원료1 조성(%)', color: COLORS.green },
              { field: `material${i}Composition`, label: `원료${i} 조성(%)`, color: COLORS.orange },
            ],
          };
        }
      }
    }

    return refs;
  }, [electrodeMaterialCount, formValues]);

  // LocalStorage에서 기본값 불러오기
  useEffect(() => {
    if (Object.keys(formValues).length === 0) return;
    const defaults = loadWorklogDefaults('slurry');
    if (defaults) {
      setFormValues(prev => ({ ...prev, ...defaults }));
    }
  }, [Object.keys(formValues).length > 0]);

  // Mixer 설비 목록 로드
  useEffect(() => {
    const loadMixers = async () => {
      try {
        const mixers = await getMixerEquipments();
        setMixerEquipments(mixers);
      } catch (err) {
        console.error('Mixer 설비 조회 실패:', err);
      }
    };
    loadMixers();
  }, []);

  // 고형분 자동계산 함수
  const calculateSolidContent = (dish: number, slurry: number, dry: number): number | null => {
    if (isNaN(dish) || isNaN(slurry) || isNaN(dry)) return null;
    const wetMass = slurry - dish;
    const dryMass = dry - dish;
    if (wetMass <= 0) return null;
    return Number(((dryMass / wetMass) * 100).toFixed(2));
  };

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => {
      const newValues = { ...prev, [rangeName]: value };

      // 양극재/음극재 선택 시 설계정보에서 자재투입정보 자동 채움
      if (rangeName === 'material1Name' && specification) {
        const electrode = value === '양극재' ? specification.cathode : specification.anode;
        if (electrode) {
          // activeMaterial, conductor(도전재), binder를 순서대로 합침
          const activeMaterialItems = electrode.activeMaterial.map(m => ({ name: value, composition: m.value }));
          const allMaterials = [
            ...activeMaterialItems,
            ...electrode.conductor.map(m => ({ name: '도전재', composition: m.value })),
            ...electrode.binder.map(m => ({ name: '바인더', composition: m.value })),
          ];

          // 자재 수 저장 (동적 readOnly 계산용)
          setActiveMaterialCount(Math.min(allMaterials.length, 6));
          // 양극재/음극재 행 수 저장 (이 행까지는 투입량설계 입력 가능)
          setElectrodeMaterialCount(Math.min(activeMaterialItems.length, 6));

          // 최대 6행까지 채움
          allMaterials.slice(0, 6).forEach((mat, i) => {
            const rowNum = i + 1;
            newValues[`material${rowNum}Name`] = mat.name;
            newValues[`material${rowNum}Composition`] = mat.composition;
          });

          // 남은 행은 비움 (LOT, PlannedInput, ActualInput도 비움)
          for (let i = allMaterials.length + 1; i <= 6; i++) {
            newValues[`material${i}Name`] = '';
            newValues[`material${i}Composition`] = '';
            newValues[`material${i}Lot`] = '';
            newValues[`material${i}PlannedInput`] = '';
            newValues[`material${i}ActualInput`] = '';
          }

          // 조성(%) 변경되었으므로 투입량설계 자동 재계산
          // 양극재/음극재 마지막 행을 기준으로 다음 행들 계산
          const electrodeLastRow = Math.min(activeMaterialItems.length, 6);
          const baseRowPlanned = parseFloat(newValues[`material${electrodeLastRow}PlannedInput`]);
          const baseRowComp = parseFloat(newValues[`material${electrodeLastRow}Composition`]);
          if (!isNaN(baseRowPlanned) && !isNaN(baseRowComp) && baseRowComp > 0) {
            for (let i = electrodeLastRow + 1; i <= Math.min(allMaterials.length, 6); i++) {
              const materialComp = parseFloat(newValues[`material${i}Composition`]);
              if (!isNaN(materialComp) && materialComp > 0) {
                newValues[`material${i}PlannedInput`] = Number(
                  ((baseRowPlanned / baseRowComp) * materialComp).toFixed(3),
                );
              }
            }
          }
        }
      }

      // 자재투입정보 투입량설계 자동 계산 (양극재/음극재 이후 행)
      // 양극재/음극재 투입량설계 또는 binderSolution 변경 시 다음 행들(도전재, 바인더) 자동 계산
      // 도전재: material{N}PlannedInput = material1PlannedInput / material1Composition * material{N}Composition
      // 바인더: material{N}PlannedInput = material1PlannedInput / material1Composition * material{N}Composition / binderSolution
      const electrodeCount = electrodeMaterialCount || 1;
      const isElectrodePlannedInput = Array.from({ length: electrodeCount }, (_, i) => `material${i + 1}PlannedInput`).includes(rangeName);
      const isBinderSolutionChange = rangeName === 'binderSolution';
      if (isElectrodePlannedInput || isBinderSolutionChange) {
        // 1행 기준으로 계산
        const material1Planned = parseFloat(newValues.material1PlannedInput);
        const material1Comp = parseFloat(newValues.material1Composition);
        const binderSol = parseFloat(newValues.binderSolution);

        if (!isNaN(material1Planned) && !isNaN(material1Comp) && material1Comp > 0) {
          for (let i = electrodeCount + 1; i <= 6; i++) {
            const materialName = newValues[`material${i}Name`];
            const materialComp = parseFloat(newValues[`material${i}Composition`]);
            if (!isNaN(materialComp) && materialComp > 0) {
              // 바인더 행은 binderSolution으로 추가 나누기
              if (materialName === '바인더' && !isNaN(binderSol) && binderSol > 0) {
                newValues[`material${i}PlannedInput`] = Number(
                  ((material1Planned / material1Comp) * materialComp / binderSol).toFixed(3),
                );
              } else if (materialName !== '바인더') {
                // 도전재 등 다른 행
                newValues[`material${i}PlannedInput`] = Number(
                  ((material1Planned / material1Comp) * materialComp).toFixed(3),
                );
              }
            }
          }
        }
      }

      // 바인더 행, 도전재 행, 활물질(양극재/음극재) 행 찾기
      let binderRow = 0;
      const conductorRows: number[] = [];
      const electrodeRows: number[] = [];
      for (let i = 1; i <= 6; i++) {
        const materialName = newValues[`material${i}Name`];
        if (materialName === '바인더') {
          binderRow = i;
        } else if (materialName === '도전재') {
          conductorRows.push(i);
        } else if (materialName === '양극재' || materialName === '음극재') {
          electrodeRows.push(i);
        }
      }

      // pdMixer1Input1 자동계산: 바인더 투입량설계 * pdMixer1InputRate1
      const shouldRecalcPdMixer1Input1 =
        (binderRow > 0 && rangeName === `material${binderRow}PlannedInput`) ||
        rangeName === 'pdMixer1InputRate1' ||
        rangeName === 'material1PlannedInput' ||
        rangeName === 'binderSolution';
      if (shouldRecalcPdMixer1Input1 && binderRow > 0) {
        const binderPlannedInput = parseFloat(newValues[`material${binderRow}PlannedInput`]);
        const inputRate1 = parseFloat(newValues.pdMixer1InputRate1);
        if (!isNaN(binderPlannedInput) && !isNaN(inputRate1)) {
          newValues.pdMixer1Input1 = Number((binderPlannedInput * inputRate1).toFixed(3));
        }
      }

      // pdMixer1Input2 자동계산: 도전재1 투입량설계 * pdMixer1InputRate2
      const conductor1Row = conductorRows[0] || 0;
      const shouldRecalcPdMixer1Input2 =
        (conductor1Row > 0 && rangeName === `material${conductor1Row}PlannedInput`) ||
        rangeName === 'pdMixer1InputRate2' ||
        rangeName === 'material1PlannedInput' ||
        rangeName === 'binderSolution';
      if (shouldRecalcPdMixer1Input2 && conductor1Row > 0) {
        const conductor1PlannedInput = parseFloat(newValues[`material${conductor1Row}PlannedInput`]);
        const inputRate2 = parseFloat(newValues.pdMixer1InputRate2);
        if (!isNaN(conductor1PlannedInput) && !isNaN(inputRate2)) {
          newValues.pdMixer1Input2 = Number((conductor1PlannedInput * inputRate2).toFixed(3));
        }
      }

      // pdMixer1Input3 자동계산: 도전재2 투입량설계 * pdMixer1InputRate3 (도전재2가 있을 때만)
      const conductor2Row = conductorRows[1] || 0;
      const shouldRecalcPdMixer1Input3 =
        (conductor2Row > 0 && rangeName === `material${conductor2Row}PlannedInput`) ||
        rangeName === 'pdMixer1InputRate3' ||
        rangeName === 'material1PlannedInput' ||
        rangeName === 'binderSolution';
      if (shouldRecalcPdMixer1Input3 && conductor2Row > 0) {
        const conductor2PlannedInput = parseFloat(newValues[`material${conductor2Row}PlannedInput`]);
        const inputRate3 = parseFloat(newValues.pdMixer1InputRate3);
        if (!isNaN(conductor2PlannedInput) && !isNaN(inputRate3)) {
          newValues.pdMixer1Input3 = Number((conductor2PlannedInput * inputRate3).toFixed(3));
        }
      }

      // pdMixer1Input4 자동계산: 활물질1(양극재/음극재) 투입량설계 * pdMixer1InputRate4
      const electrode1Row = electrodeRows[0] || 0;
      const shouldRecalcPdMixer1Input4 =
        (electrode1Row > 0 && rangeName === `material${electrode1Row}PlannedInput`) ||
        rangeName === 'pdMixer1InputRate4';
      if (shouldRecalcPdMixer1Input4 && electrode1Row > 0) {
        const electrode1PlannedInput = parseFloat(newValues[`material${electrode1Row}PlannedInput`]);
        const inputRate4 = parseFloat(newValues.pdMixer1InputRate4);
        if (!isNaN(electrode1PlannedInput) && !isNaN(inputRate4)) {
          newValues.pdMixer1Input4 = Number((electrode1PlannedInput * inputRate4).toFixed(3));
        }
      }

      // pdMixer1Input5 자동계산: 활물질2 투입량설계 * pdMixer1InputRate5 (활물질2가 있을 때만)
      const electrode2Row = electrodeRows[1] || 0;
      const shouldRecalcPdMixer1Input5 =
        (electrode2Row > 0 && rangeName === `material${electrode2Row}PlannedInput`) ||
        rangeName === 'pdMixer1InputRate5';
      if (shouldRecalcPdMixer1Input5 && electrode2Row > 0) {
        const electrode2PlannedInput = parseFloat(newValues[`material${electrode2Row}PlannedInput`]);
        const inputRate5 = parseFloat(newValues.pdMixer1InputRate5);
        if (!isNaN(electrode2PlannedInput) && !isNaN(inputRate5)) {
          newValues.pdMixer1Input5 = Number((electrode2PlannedInput * inputRate5).toFixed(3));
        }
      }

      // pdMixer1Input6 자동계산: solventAddPlannedInput * pdMixer1InputRate6
      const shouldRecalcPdMixer1Input6 =
        rangeName === 'solventAddPlannedInput' ||
        rangeName === 'pdMixer1InputRate6' ||
        rangeName === 'solventTotalPlannedInput' ||
        rangeName === 'material1PlannedInput' ||
        rangeName === 'material1Composition' ||
        rangeName === 'solidContent' ||
        (binderRow > 0 && rangeName === `material${binderRow}PlannedInput`) ||
        rangeName === 'binderSolution';
      if (shouldRecalcPdMixer1Input6) {
        const solventAddPlanned = parseFloat(newValues.solventAddPlannedInput);
        const inputRate6 = parseFloat(newValues.pdMixer1InputRate6);
        if (!isNaN(solventAddPlanned) && !isNaN(inputRate6)) {
          newValues.pdMixer1Input6 = Number((solventAddPlanned * inputRate6).toFixed(3));
        }
      }

      // pdMixer1SolidContent1~6, pdMixer2Input1, pdMixer2SolidContent1 자동계산
      const pdMixer1InputTriggers = [
        'pdMixer1Input1', 'pdMixer1Input2', 'pdMixer1Input3', 'pdMixer1Input4', 'pdMixer1Input5', 'pdMixer1Input6',
        'pdMixer2Input1', 'pdMixer2InputRate1',
        'binderSolution',
        'pdMixer1InputRate1', 'pdMixer1InputRate2', 'pdMixer1InputRate3', 'pdMixer1InputRate4', 'pdMixer1InputRate5', 'pdMixer1InputRate6',
        'material1PlannedInput', 'material2PlannedInput',
        'solventAddPlannedInput', 'solventTotalPlannedInput', 'solidContent', 'material1Composition',
      ];
      if (binderRow > 0) pdMixer1InputTriggers.push(`material${binderRow}PlannedInput`);
      if (conductor1Row > 0) pdMixer1InputTriggers.push(`material${conductor1Row}PlannedInput`);
      if (conductor2Row > 0) pdMixer1InputTriggers.push(`material${conductor2Row}PlannedInput`);
      if (electrode1Row > 0) pdMixer1InputTriggers.push(`material${electrode1Row}PlannedInput`);
      if (electrode2Row > 0) pdMixer1InputTriggers.push(`material${electrode2Row}PlannedInput`);

      const shouldRecalcPdMixer1SolidContent = pdMixer1InputTriggers.includes(rangeName);
      if (shouldRecalcPdMixer1SolidContent) {
        const input1 = parseFloat(newValues.pdMixer1Input1) || 0;
        const input2 = parseFloat(newValues.pdMixer1Input2) || 0;
        const input3 = parseFloat(newValues.pdMixer1Input3) || 0;
        const input4 = parseFloat(newValues.pdMixer1Input4) || 0;
        const input5 = parseFloat(newValues.pdMixer1Input5) || 0;
        const binderSol = parseFloat(newValues.binderSolution);

        // pdMixer1SolidContent1: = SUM(input1 * binderSolution) / SUM(input1) = binderSolution
        if (input1 > 0 && !isNaN(binderSol)) {
          newValues.pdMixer1SolidContent1 = binderSol;
        }

        // pdMixer1SolidContent2: = (input1 * binderSolution + input2) / (input1 + input2)
        if (input1 > 0 && input2 > 0 && !isNaN(binderSol)) {
          const sumInputs = input1 + input2;
          const weightedSum = input1 * binderSol + input2;
          newValues.pdMixer1SolidContent2 = Number((weightedSum / sumInputs).toFixed(4));
        }

        // pdMixer1SolidContent3: = (input1 * binderSolution + input2 + input3) / (input1 + input2 + input3)
        if (input1 > 0 && input2 > 0 && input3 > 0 && !isNaN(binderSol)) {
          const sumInputs = input1 + input2 + input3;
          const weightedSum = input1 * binderSol + input2 + input3;
          newValues.pdMixer1SolidContent3 = Number((weightedSum / sumInputs).toFixed(4));
        }

        // pdMixer1SolidContent4: = (input1 * binderSolution + input2 + input3 + input4) / (input1 + input2 + input3 + input4)
        if (input1 > 0 && input2 > 0 && input3 > 0 && input4 > 0 && !isNaN(binderSol)) {
          const sumInputs = input1 + input2 + input3 + input4;
          const weightedSum = input1 * binderSol + input2 + input3 + input4;
          newValues.pdMixer1SolidContent4 = Number((weightedSum / sumInputs).toFixed(4));
        }

        // pdMixer1SolidContent5: = (input1 * binderSolution + input2 + input3 + input4 + input5) / (input1 + ... + input5)
        if (input1 > 0 && input2 > 0 && input3 > 0 && input4 > 0 && input5 > 0 && !isNaN(binderSol)) {
          const sumInputs = input1 + input2 + input3 + input4 + input5;
          const weightedSum = input1 * binderSol + input2 + input3 + input4 + input5;
          newValues.pdMixer1SolidContent5 = Number((weightedSum / sumInputs).toFixed(4));
        }

        // pdMixer1SolidContent6: = (input1 * binderSolution + input2 + input3 + input4 + input5) / (input1 + ... + input6)
        // 분자는 input1~5까지, 분모는 input1~6까지 (용매는 분자에 포함 안됨)
        const input6 = parseFloat(newValues.pdMixer1Input6) || 0;
        if (input1 > 0 && input6 > 0 && !isNaN(binderSol)) {
          const sumInputs = input1 + input2 + input3 + input4 + input5 + input6;
          const weightedSum = input1 * binderSol + input2 + input3 + input4 + input5;
          newValues.pdMixer1SolidContent6 = Number((weightedSum / sumInputs).toFixed(4));
        }

        // pdMixer2Input1 자동계산: solventAddPlannedInput * pdMixer2InputRate1
        const solventAddPlanned = parseFloat(newValues.solventAddPlannedInput);
        const pdMixer2InputRate1 = parseFloat(newValues.pdMixer2InputRate1);
        if (!isNaN(solventAddPlanned) && !isNaN(pdMixer2InputRate1)) {
          newValues.pdMixer2Input1 = Number((solventAddPlanned * pdMixer2InputRate1).toFixed(3));
        }

        // pdMixer2SolidContent1: = (input1 * binderSolution + input2~5) / (pdMixer1Input1~6 + pdMixer2Input1)
        const pdMixer2Input1Val = parseFloat(newValues.pdMixer2Input1) || 0;
        if (input1 > 0 && pdMixer2Input1Val > 0 && !isNaN(binderSol)) {
          const sumInputs = input1 + input2 + input3 + input4 + input5 + input6 + pdMixer2Input1Val;
          const weightedSum = input1 * binderSol + input2 + input3 + input4 + input5;
          newValues.pdMixer2SolidContent1 = Number((weightedSum / sumInputs).toFixed(4));
        }
      }

      // solventTotalPlannedInput 자동계산:
      // = material1PlannedInput / material1Composition / solidContent - material1PlannedInput / material1Composition
      const isMaterial1PlannedChange = rangeName === 'material1PlannedInput';
      const isMaterial1CompChange = rangeName === 'material1Composition';
      const isSolidContentChange = rangeName === 'solidContent';
      if (isMaterial1PlannedChange || isMaterial1CompChange || isSolidContentChange) {
        const mat1Planned = parseFloat(newValues.material1PlannedInput);
        const mat1Comp = parseFloat(newValues.material1Composition);
        const solidCont = parseFloat(newValues.solidContent);

        if (!isNaN(mat1Planned) && !isNaN(mat1Comp) && mat1Comp > 0 && !isNaN(solidCont) && solidCont > 0) {
          // solventTotalPlannedInput = mat1Planned / mat1Comp / solidContent - mat1Planned / mat1Comp
          const baseCalc = mat1Planned / mat1Comp;
          const solventTotal = baseCalc / solidCont - baseCalc;
          newValues.solventTotalPlannedInput = Number(solventTotal.toFixed(3));
        }
      }

      // solventAddPlannedInput 자동계산: solventTotalPlannedInput - 바인더투입설계 * (1 - binderSolution)
      // 바인더 행 찾기
      let binderRowNum = 0;
      for (let i = 1; i <= 6; i++) {
        if (newValues[`material${i}Name`] === '바인더') {
          binderRowNum = i;
          break;
        }
      }
      // solventTotalPlannedInput이 자동계산된 경우도 포함
      const shouldRecalcSolventAdd =
        rangeName === 'solventTotalPlannedInput' ||
        rangeName === 'material1PlannedInput' ||
        rangeName === 'material1Composition' ||
        rangeName === 'solidContent' ||
        (binderRowNum > 0 && rangeName === `material${binderRowNum}PlannedInput`) ||
        rangeName === 'binderSolution';
      if (shouldRecalcSolventAdd) {
        const solventTotal = parseFloat(newValues.solventTotalPlannedInput);
        const binderPlanned = binderRowNum > 0 ? parseFloat(newValues[`material${binderRowNum}PlannedInput`]) : NaN;
        const binderSol = parseFloat(newValues.binderSolution);

        if (!isNaN(solventTotal) && !isNaN(binderPlanned) && !isNaN(binderSol)) {
          // solventAddPlannedInput = solventTotalPlannedInput - 바인더투입설계 * (1 - binderSolution)
          const solventAdd = solventTotal - binderPlanned * (1 - binderSol);
          newValues.solventAddPlannedInput = Number(solventAdd.toFixed(3));
        }
      }

      // 고형분 1-3 자동계산
      const solidContentGroups = [1, 2, 3];
      solidContentGroups.forEach(num => {
        const dishKey = `solidContent${num}Dish`;
        const slurryKey = `solidContent${num}Slurry`;
        const dryKey = `solidContent${num}Dry`;
        const percentageKey = `solidContent${num}Percentage`;

        if (rangeName === dishKey || rangeName === slurryKey || rangeName === dryKey) {
          const dish = parseFloat(newValues[dishKey]);
          const slurryVal = parseFloat(newValues[slurryKey]);
          const dry = parseFloat(newValues[dryKey]);
          const percentage = calculateSolidContent(dish, slurryVal, dry);
          if (percentage !== null) {
            newValues[percentageKey] = percentage;
          }
        }
      });

      return newValues;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, SLURRY_NUMERIC_FIELDS) as SlurryWorklogPayload;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createSlurryWorklog(Number(projectId), payload);
      // 저장 성공 시 기본값 저장
      saveWorklogDefaults('slurry', formValues);
      saveWorklogAllFields('slurry', formValues);
      toast.success('작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Electrode&process=Slurry`);
    } catch (err) {
      toast.error('저장 실패: ' + err);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('입력한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Electrode&process=Slurry`);
    }
  };

  // 이전 내용 불러오기
  const handleLoadPrevious = () => {
    const savedFields = loadWorklogAllFields('slurry');
    if (savedFields) {
      setFormValues(prev => ({ ...prev, ...savedFields }));
      toast.success('이전 등록 내용을 불러왔습니다.');
    } else {
      toast.error('저장된 이전 내용이 없습니다.');
    }
  };

  if (templateLoading) {
    return (
      <div className={styles.container}>
        <p>엑셀 템플릿을 불러오는 중...</p>
      </div>
    );
  }

  if (templateError) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>엑셀 템플릿 로드 실패: {templateError.message}</p>
      </div>
    );
  }

  if (!workbook) {
    return (
      <div className={styles.container}>
        <p>엑셀 템플릿을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 드롭다운 옵션 생성
  const mixerOptions = mixerEquipments.map(eq => eq.name);
  const plantOptions = plantEquipments.map(eq => eq.name);

  // PD Mixer 이름 드롭다운 (pdMixer1Name ~ pdMixer4Name)
  const pdMixerNameFields =
    mixerOptions.length > 0
      ? Object.fromEntries(
          ['pdMixer1Name', 'pdMixer2Name', 'pdMixer3Name', 'pdMixer4Name'].map(field => [field, mixerOptions]),
        )
      : {};

  // 자재투입정보 구분 드롭다운 (1행만 양극재/음극재 선택)
  const materialNameFields = {
    material1Name: ELECTRODE_TYPE_OPTIONS,
  };

  // 자재투입정보 LOT 드롭다운 (카테고리 선택 시 연동)
  // 바인더 행은 콤보박스(선택+입력), 그 외는 선택박스
  const materialLotOptionsFromMaterial = [
    material1LotOptions,
    material2LotOptions,
    material3LotOptions,
    material4LotOptions,
    material5LotOptions,
    material6LotOptions,
  ];
  const materialLotFields: Record<string, string[]> = {};
  const binderLotComboFields: Record<string, string[]> = {};
  for (let i = 1; i <= 6; i++) {
    const materialName = formValues[`material${i}Name`];
    if (materialName === '바인더') {
      // 바인더 행은 콤보박스 (선택 + 직접입력)
      if (binderSolutionLotOptions.length > 0) {
        binderLotComboFields[`material${i}Lot`] = binderSolutionLotOptions;
      }
    } else {
      // 그 외는 자재 LOT 선택박스
      const opts = materialLotOptionsFromMaterial[i - 1];
      if (opts && opts.length > 0) {
        materialLotFields[`material${i}Lot`] = opts;
      }
    }
  }
  const slurrySelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 ? { plant: plantOptions } : {}),
    ...pdMixerNameFields,
    ...materialNameFields,
    ...materialLotFields,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h2>Slurry Mixing 작업일지 등록</h2>
            {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
            <p className={styles.hint}>파란색: 입력 / 연두색: 선택 / 노란색: 자동입력</p>
          </div>
          <button
            onClick={handleLoadPrevious}
            className={styles.loadPreviousButton}
            disabled={saving}
            title='마지막으로 저장한 작업일지 내용을 불러옵니다 (프로젝트명, 날짜, 작성자 제외)'
          >
            이전 내용 불러오기
          </button>
        </div>
        <div className={styles.actions}>
          <button onClick={handleCancel} className={styles.cancelButton} disabled={saving}>
            취소
          </button>
          <button onClick={handleSave} className={styles.saveButton} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <div className={styles.excelWrapper}>
        <ExcelRenderer
          workbook={workbook}
          editableRanges={Object.keys(namedRanges).filter(name => !dynamicReadOnlyFields.includes(name))}
          cellValues={formValues}
          namedRanges={namedRanges}
          onCellChange={handleCellChange}
          multilineFields={SLURRY_MULTILINE_FIELDS}
          timeFields={SLURRY_TIME_FIELDS}
          numericFields={SLURRY_NUMERIC_FIELDS}
          readOnlyFields={dynamicReadOnlyFields}
          selectFields={slurrySelectFields}
          comboFields={binderLotComboFields}
          dateFields={['manufactureDate']}
          uppercaseFields={['lot']}
          tooltips={fieldTooltips}
          formulaRefs={formulaRefs}
        />
      </div>
    </div>
  );
}
