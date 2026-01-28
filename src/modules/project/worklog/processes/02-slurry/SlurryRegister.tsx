import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { useMaterialCategories } from '../../shared/useMaterialCategories';
import { useMaterialLots } from '../../shared/useMaterialLots';
import { useBinderLots } from '../../shared/useBinderLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { SLURRY_NUMERIC_FIELDS } from '../../shared/numericFields';
import { createSlurryWorklog } from '../../../../../api/project/worklog';
import type { SlurryWorklogPayload } from './SlurryTypes';
import { SLURRY_TIME_FIELDS, SLURRY_MULTILINE_FIELDS, SLURRY_READONLY_FIELDS } from './slurryConstants';
import { getMixerEquipments } from '../../../../../api/plant/EquipmentService';
import type { Equipment } from '../../../../plant/register/EquipmentTypes';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';

// 라인명 고정 옵션
const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];

export default function SlurryRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('slurry');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { categories: materialCategories } = useMaterialCategories();

  // 자재 1~6에 대한 LOT 목록 조회
  const { lotOptions: material1LotOptions } = useMaterialLots(formValues.material1Name);
  const { lotOptions: material2LotOptions } = useMaterialLots(formValues.material2Name);
  const { lotOptions: material3LotOptions } = useMaterialLots(formValues.material3Name);
  const { lotOptions: material4LotOptions } = useMaterialLots(formValues.material4Name);
  const { lotOptions: material5LotOptions } = useMaterialLots(formValues.material5Name);
  const { lotOptions: material6LotOptions } = useMaterialLots(formValues.material6Name);
  // 바인더용액 LOT 목록 조회 (Binder 작업일지에서)
  const { lotOptions: binderSolutionLotOptions, getLotSolidContent } = useBinderLots(projectId);

  const [saving, setSaving] = useState(false);
  const [mixerEquipments, setMixerEquipments] = useState<Equipment[]>([]);

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

      // 바인더용액 LOT 선택 시 binderSolution 자동 입력
      if (rangeName === 'binderSolutionLot' && value) {
        const solidContent = getLotSolidContent(value);
        if (solidContent !== null) {
          newValues.binderSolution = solidContent;
        }
      }

      // pdMixer1Input1 자동계산: binderSolutionPlannedInput * (pdMixer1InputRate1 / 100)
      if (rangeName === 'binderSolutionPlannedInput' || rangeName === 'pdMixer1InputRate1') {
        const plannedInput = parseFloat(newValues.binderSolutionPlannedInput);
        const inputRate = parseFloat(newValues.pdMixer1InputRate1);
        if (!isNaN(plannedInput) && !isNaN(inputRate)) {
          newValues.pdMixer1Input1 = Number((plannedInput * inputRate / 100).toFixed(3));
        }
      }

      // pdMixer1SolidContent1 자동계산: binderSolution 값 그대로
      if (rangeName === 'binderSolution' || rangeName === 'pdMixer1Input1' || rangeName === 'binderSolutionLot') {
        const binderSol = parseFloat(newValues.binderSolution);
        if (!isNaN(binderSol)) {
          newValues.pdMixer1SolidContent1 = binderSol;
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
      alert('작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Electrode&process=Slurry`);
    } catch (err) {
      alert('저장 실패: ' + err);
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
  const pdMixerNameFields = mixerOptions.length > 0
    ? Object.fromEntries(
        ['pdMixer1Name', 'pdMixer2Name', 'pdMixer3Name', 'pdMixer4Name'].map(field => [field, mixerOptions])
      )
    : {};

  // 자재투입정보 구분 드롭다운 (material1~material6)
  const materialNameFields = materialCategories.length > 0
    ? Object.fromEntries(
        Array.from({ length: 6 }, (_, i) => [`material${i + 1}Name`, materialCategories])
      )
    : {};

  // 자재투입정보 LOT 드롭다운 (카테고리 선택 시 연동)
  const materialLotOptions = [
    material1LotOptions, material2LotOptions, material3LotOptions,
    material4LotOptions, material5LotOptions, material6LotOptions,
  ];
  const materialLotFields = Object.fromEntries(
    materialLotOptions
      .map((opts, i) => [`material${i + 1}Lot`, opts])
      .filter(([, opts]) => (opts as string[]).length > 0)
  );
  // 바인더용액 LOT 드롭다운
  const binderSolutionLotField = binderSolutionLotOptions.length > 0
    ? { binderSolutionLot: binderSolutionLotOptions }
    : {};

  const slurrySelectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    ...pdMixerNameFields,
    ...materialNameFields,
    ...materialLotFields,
    ...binderSolutionLotField,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Slurry Mixing 작업일지 등록</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
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
          editableRanges={Object.keys(namedRanges).filter(name => !SLURRY_READONLY_FIELDS.includes(name))}
          cellValues={formValues}
          namedRanges={namedRanges}
          onCellChange={handleCellChange}
          multilineFields={SLURRY_MULTILINE_FIELDS}
          timeFields={SLURRY_TIME_FIELDS}
          numericFields={SLURRY_NUMERIC_FIELDS}
          readOnlyFields={SLURRY_READONLY_FIELDS}
          selectFields={slurrySelectFields}
          dateFields={['manufactureDate']}
          uppercaseFields={['lot']}
        />
      </div>

      <div className={styles.footer}>
        <p className={styles.hint}>파란색으로 표시된 셀에 값을 입력할 수 있습니다.</p>
      </div>
    </div>
  );
}
