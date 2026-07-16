import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useMaterialLots } from '../../shared/useMaterialLots';
import { useBinderLots } from '../../shared/useBinderLots';
import { useProjectSpecification } from '../../shared/useProjectSpecification';
import SpecificationMissingModal from '../../shared/SpecificationMissingModal';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getSlurryWorklog, updateSlurryWorklog } from '../../../../../api/project/worklog';
import type { SlurryWorklog, SlurryWorklogPayload } from './SlurryTypes';
import {
  SLURRY_TIME_FIELDS,
  SLURRY_MULTILINE_FIELDS,
  SLURRY_READONLY_FIELDS,
  MATERIAL_FIELD_SUFFIXES,
} from './slurryConstants';
import { SLURRY_NUMERIC_FIELDS } from '../../shared/numericFields';
import { getMixerEquipments } from '../../../../../api/plant/EquipmentService';
import type { Equipment } from '../../../../plant/register/EquipmentTypes';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';
import { getErrorMessage } from '../../../../../api/errorHandler';

// 라인명 고정 옵션
const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

// 양극재/음극재 선택 옵션
const ELECTRODE_TYPE_OPTIONS = ['양극재', '음극재'];

export default function SlurryEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('slurry');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const [worklogData, setWorklogData] = useState<SlurryWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { specification, notFound: specificationNotFound } = useProjectSpecification(projectId);

  // 자재 1~6에 대한 LOT 목록 조회
  const { lotOptions: material1LotOptions } = useMaterialLots(formValues.material1Name);
  const { lotOptions: material2LotOptions } = useMaterialLots(formValues.material2Name);
  const { lotOptions: material3LotOptions } = useMaterialLots(formValues.material3Name);
  const { lotOptions: material4LotOptions } = useMaterialLots(formValues.material4Name);
  const { lotOptions: material5LotOptions } = useMaterialLots(formValues.material5Name);
  const { lotOptions: material6LotOptions } = useMaterialLots(formValues.material6Name);
  // 바인더용액 LOT 목록 조회 (Binder 작업일지에서)
  const { lotOptions: binderSolutionLotOptions } = useBinderLots(projectId);

  const [mixerEquipments, setMixerEquipments] = useState<Equipment[]>([]);
  // 설계정보에서 가져온 자재 수 (동적 readOnly 계산용)
  const [activeMaterialCount, setActiveMaterialCount] = useState(0);
  // 양극재/음극재(activeMaterial) 행 수 - 이 행까지는 투입량설계 입력 가능
  const [electrodeMaterialCount, setElectrodeMaterialCount] = useState(0);
  // 설계정보를 사용할 수 없어 자재투입정보를 직접입력 모드로 전환했는지 여부
  const [manualMaterialEntry, setManualMaterialEntry] = useState(false);
  // 설계정보 누락 안내 모달 상태
  const [specMissingModal, setSpecMissingModal] = useState<{ reason: 'notFound' | 'empty' } | null>(null);

  // 동적 readOnly 필드 계산: 설계정보에서 가져온 자재 수에 따라 사용하지 않는 행은 전체 readOnly
  const dynamicReadOnlyFields = useMemo(() => {
    const fields: string[] = [...SLURRY_READONLY_FIELDS];

    // 설계정보를 사용할 수 없어 직접입력 모드로 전환된 경우, 자재투입정보 1~6행은 모두 직접 입력 가능
    if (manualMaterialEntry) {
      return fields;
    }

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
  }, [activeMaterialCount, electrodeMaterialCount, manualMaterialEntry]);

  // 자동계산 필드 툴팁 생성
  const fieldTooltips = useMemo(() => {
    const tips: Record<string, string> = {
      // 고형분 자동계산
      solidContent1Percentage: '= (고형분1 Dry중량 - 고형분1 Dish중량) / (고형분1 Slurry중량 - 고형분1 Dish중량) × 100',
      solidContent2Percentage: '= (고형분2 Dry중량 - 고형분2 Dish중량) / (고형분2 Slurry중량 - 고형분2 Dish중량) × 100',
      solidContent3Percentage: '= (고형분3 Dry중량 - 고형분3 Dish중량) / (고형분3 Slurry중량 - 고형분3 Dish중량) × 100',
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
            `= 원료1 투입량설계 / 원료1 조성(%) × 원료${i} 조성(%)`;
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

    if (binderRowNum > 0) {
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

    // 도전재/바인더 투입량설계 자동계산
    if (electrodeMaterialCount > 0) {
      for (let i = electrodeMaterialCount + 1; i <= 6; i++) {
        const materialName = formValues[`material${i}Name`];
        if (materialName === '바인더') {
          refs[`material${i}PlannedInput`] = {
            formula: `= 원료1 투입량설계 / 원료1 조성(%) × 원료${i} 조성(%)`,
            refs: [
              { field: 'material1PlannedInput', label: '원료1 투입량설계', color: COLORS.blue },
              { field: 'material1Composition', label: '원료1 조성(%)', color: COLORS.green },
              { field: `material${i}Composition`, label: `원료${i} 조성(%)`, color: COLORS.orange },
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

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getSlurryWorklog(Number(projectId), Number(worklogId));
        setWorklogData(data);

        // SlurryWorklog 데이터를 Named Range에 맞춰 formValues로 변환
        const values: Record<string, any> = {};
        Object.keys(namedRanges).forEach(rangeName => {
          if (rangeName === 'projectId' && project) {
            values[rangeName] = project.name;
          } else {
            values[rangeName] = (data as any)[rangeName] ?? '';
          }
        });

        // 기존 데이터에서 자재 행 정보 분석하여 activeMaterialCount, electrodeMaterialCount 설정
        let activeCount = 0;
        let electrodeCount = 0;
        for (let i = 1; i <= 6; i++) {
          const materialName = values[`material${i}Name`];
          if (materialName) {
            activeCount = i;
            if (materialName === '양극재' || materialName === '음극재') {
              electrodeCount = i;
            }
          }
        }
        setActiveMaterialCount(activeCount);
        setElectrodeMaterialCount(electrodeCount);

        setFormValues(values);
      } catch (err: any) {
        console.error('작업일지 조회 실패:', err);
        alert(getErrorMessage(err, '작업일지를 불러오는데 실패했습니다.'));
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId, namedRanges]);

  // 고형분 자동계산 함수
  const calculateSolidContent = (
    dish: number,
    slurry: number,
    dry: number
  ): number | null => {
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
      if (rangeName === 'material1Name') {
        const electrode = specification ? (value === '양극재' ? specification.cathode : specification.anode) : null;
        const hasElectrodeData =
          !!electrode &&
          (electrode.activeMaterial.length > 0 || electrode.conductor.length > 0 || electrode.binder.length > 0);

        if (!hasElectrodeData) {
          // 생산계획/설계정보를 사용할 수 없음 - 사용자에게 안내 후 직접입력 여부 확인
          setSpecMissingModal({ reason: specificationNotFound ? 'notFound' : 'empty' });
          setManualMaterialEntry(false);
          return newValues;
        }

        if (electrode) {
          setManualMaterialEntry(false);
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
      // 양극재/음극재 투입량설계 변경 시 다음 행들(도전재, 바인더) 자동 계산
      // 도전재/바인더: material{N}PlannedInput = material1PlannedInput / material1Composition * material{N}Composition
      const electrodeCount = electrodeMaterialCount || 1;
      const isElectrodePlannedInput = Array.from({ length: electrodeCount }, (_, i) => `material${i + 1}PlannedInput`).includes(rangeName);
      if (isElectrodePlannedInput) {
        const material1Planned = parseFloat(newValues.material1PlannedInput);
        const material1Comp = parseFloat(newValues.material1Composition);

        if (!isNaN(material1Planned) && !isNaN(material1Comp) && material1Comp > 0) {
          for (let i = electrodeCount + 1; i <= 6; i++) {
            const materialComp = parseFloat(newValues[`material${i}Composition`]);
            if (!isNaN(materialComp) && materialComp > 0) {
              newValues[`material${i}PlannedInput`] = Number(
                ((material1Planned / material1Comp) * materialComp).toFixed(3),
              );
            }
          }
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
    if (!projectId || !worklogId) return;

    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, SLURRY_NUMERIC_FIELDS) as Partial<SlurryWorklogPayload>;
      // plant 이름을 ID로 변환
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await updateSlurryWorklog(Number(projectId), Number(worklogId), payload);
      alert('작업일지가 수정되었습니다.');
      navigate(`/project/log/${projectId}?category=Electrode&process=Slurry`);
    } catch (err) {
      alert(getErrorMessage(err, '수정에 실패했습니다.'));
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('수정한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Electrode&process=Slurry`);
    }
  };

  // 설계정보 누락 안내 모달 - 직접입력 확인
  const handleConfirmManualMaterialEntry = () => {
    setSpecMissingModal(null);
    setActiveMaterialCount(0);
    setElectrodeMaterialCount(0);
    setManualMaterialEntry(true);
  };

  // 설계정보 누락 안내 모달 - 취소 (material1Name 선택 되돌림)
  const handleCancelManualMaterialEntry = () => {
    setSpecMissingModal(null);
    setFormValues(prev => ({ ...prev, material1Name: '' }));
  };

  if (templateLoading || loading) {
    return (
      <div className={styles.container}>
        <p>작업일지를 불러오는 중...</p>
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

  if (!workbook || !worklogData) {
    return (
      <div className={styles.container}>
        <p>작업일지를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 드롭다운 옵션 생성
  const mixerOptions = mixerEquipments.map(eq => eq.name);
  const plantOptions = plantEquipments.map(eq => eq.name);

  // PD Mixer 이름 드롭다운 (pdMixer1Name ~ pdMixer4Name)
  const pdMixerNameFields = mixerOptions.length > 0
    ? Object.fromEntries(
        ['pdMixer1Name', 'pdMixer2Name', 'pdMixer3Name', 'pdMixer4Name'].map(field => [field, mixerOptions])
      )
    : {};

  // 자재투입정보 구분 드롭다운 (1행만 양극재/음극재 선택)
  const materialNameFields = {
    material1Name: ELECTRODE_TYPE_OPTIONS,
  };

  // 자재투입정보 LOT 드롭다운 (카테고리 선택 시 연동)
  // 바인더 행은 콤보박스(선택+입력), 그 외는 선택박스
  const materialLotOptionsFromMaterial = [
    material1LotOptions, material2LotOptions, material3LotOptions,
    material4LotOptions, material5LotOptions, material6LotOptions,
  ];
  const materialLotMultiSelectFields: Record<string, string[]> = {};
  const binderLotComboFields: Record<string, string[]> = {};
  for (let i = 1; i <= 6; i++) {
    const materialName = formValues[`material${i}Name`];
    if (materialName === '바인더') {
      if (binderSolutionLotOptions.length > 0) {
        binderLotComboFields[`material${i}Lot`] = binderSolutionLotOptions;
      }
    } else {
      const opts = materialLotOptionsFromMaterial[i - 1];
      if (opts && opts.length > 0) {
        materialLotMultiSelectFields[`material${i}Lot`] = opts;
      }
    }
  }

  const slurrySelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 ? { plant: plantOptions } : {}),
    ...pdMixerNameFields,
    ...materialNameFields,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Slurry 작업일지 수정</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
          <p className={styles.hint}>파란색: 입력 / 연두색: 선택 / 노란색: 자동입력</p>
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
          multiSelectFields={materialLotMultiSelectFields}
          comboFields={binderLotComboFields}
          dateFields={['manufactureDate']}
          uppercaseFields={['lot']}
          tooltips={fieldTooltips}
          formulaRefs={formulaRefs}
        />
      </div>

      {specMissingModal && (
        <SpecificationMissingModal
          reason={specMissingModal.reason}
          onConfirm={handleConfirmManualMaterialEntry}
          onCancel={handleCancelManualMaterialEntry}
        />
      )}
    </div>
  );
}
