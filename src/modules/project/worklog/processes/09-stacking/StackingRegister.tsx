import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { useSeparatorLots } from '../../shared/useSeparatorLots';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { STACKING_NUMERIC_FIELDS, STACKING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import {
  saveWorklogDefaults,
  loadWorklogDefaults,
  saveWorklogAllFields,
  loadWorklogAllFields,
} from '../../shared/worklogDefaults';
import { createStackingWorklog } from '../../../../../api/project/worklog';
import type { StackingWorklogPayload } from './StackingTypes';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';
import toast from 'react-hot-toast';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 자동입력 필드 (분리막 LOT 선택 시 제조사, 스팩 자동 입력)
const SEPARATOR_AUTO_FILL_FIELDS = ['separatorManufacturer', 'separatorSpec'];
// 자동계산 필드 (양품 수량, 불량률)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (투입량 - 불량 수량)
  'stackGoodQuantity',
  'hipot1GoodQuantity',
  // 불량률 (불량 수량 / 투입량 * 100)
  'stackDefectRate',
  'hipot1DefectRate',
];

export default function StackingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('stacking');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { separatorLots } = useSeparatorLots();

  const [saving, setSaving] = useState(false);

  // 자동계산 필드 툴팁
  const fieldTooltips = useMemo(() => {
    const tips: Record<string, string> = {};
    const processes = [
      { key: 'stack', label: '스태킹' },
      { key: 'hipot1', label: 'Hipot1' },
    ];
    for (const { key, label } of processes) {
      tips[`${key}GoodQuantity`] = `= ${label} 투입량 - ${label} 불량 수량`;
      tips[`${key}DefectRate`] = `= (${label} 불량 수량 / ${label} 투입량) × 100`;
    }
    return tips;
  }, []);

  // 자동계산 필드 참조 (하이라이트용)
  const formulaRefs = useMemo(() => {
    const COLORS = { blue: '#2196F3', green: '#4CAF50' };
    const refs: Record<string, { formula: string; refs: { field: string; label: string; color: string }[] }> = {};
    const processes = [
      { key: 'stack', label: '스태킹' },
      { key: 'hipot1', label: 'Hipot1' },
    ];
    for (const { key, label } of processes) {
      refs[`${key}GoodQuantity`] = {
        formula: `= ${label} 투입량 - ${label} 불량 수량`,
        refs: [
          { field: `${key}ActualInput`, label: `${label} 투입량`, color: COLORS.blue },
          { field: `${key}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.green },
        ],
      };
      refs[`${key}DefectRate`] = {
        formula: `= (${label} 불량 수량 / ${label} 투입량) × 100`,
        refs: [
          { field: `${key}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.blue },
          { field: `${key}ActualInput`, label: `${label} 투입량`, color: COLORS.green },
        ],
      };
    }
    return refs;
  }, []);

  // LocalStorage에서 기본값 불러오기
  useEffect(() => {
    if (Object.keys(formValues).length === 0) return;
    const defaults = loadWorklogDefaults('stacking');
    if (defaults) {
      setFormValues(prev => ({ ...prev, ...defaults }));
    }
  }, [Object.keys(formValues).length > 0]);

  // 양품 수량 및 불량률 자동계산 헬퍼 함수
  const calculateAutoFields = (prev: Record<string, any>, rangeName: string, value: any): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량, 불량률 계산
    const processes = ['stack', 'hipot1'];
    for (const process of processes) {
      const inputField = `${process}ActualInput`;
      const defectField = `${process}DefectQuantity`;
      const goodField = `${process}GoodQuantity`;
      const defectRateField = `${process}DefectRate`;

      if (rangeName === inputField || rangeName === defectField) {
        const inputQty = rangeName === inputField ? value || 0 : prev[inputField] || 0;
        const defectQty = rangeName === defectField ? value || 0 : prev[defectField] || 0;
        // 양품 수량 = 투입량 - 불량 수량
        updates[goodField] = Math.max(0, Number(inputQty) - Number(defectQty));
        // 불량률 = (불량 수량 / 투입량) * 100
        updates[defectRateField] =
          Number(inputQty) > 0 ? Math.round((Number(defectQty) / Number(inputQty)) * 10000) / 100 : 0;
      }
    }

    return updates;
  };

  // 분리막 LOT 선택 시 제조사, 스팩 자동 입력 + 양품 수량 자동계산
  const handleCellChange = (rangeName: string, value: any) => {
    if (rangeName === 'separatorLot') {
      const selectedSeparator = separatorLots.find(s => s.lot === value);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        separatorManufacturer: selectedSeparator?.manufacturer || '',
        separatorSpec: selectedSeparator?.spec || '',
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        ...calculateAutoFields(prev, rangeName, value),
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, STACKING_NUMERIC_FIELDS) as StackingWorklogPayload;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createStackingWorklog(Number(projectId), payload);
      // 저장 성공 시 기본값 저장
      saveWorklogDefaults('stacking', formValues);
      saveWorklogAllFields('stacking', formValues);
      alert('작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=Stacking`);
    } catch (err) {
      alert('저장 실패: ' + err);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('입력한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Assembly&process=Stacking`);
    }
  };

  // 이전 내용 불러오기
  const handleLoadPrevious = () => {
    const savedFields = loadWorklogAllFields('stacking');
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

  const plantOptions = plantEquipments.map(eq => eq.name);
  const separatorLotOptions = separatorLots.map(s => s.lot);
  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    ...(separatorLotOptions.length > 0 && { separatorLot: separatorLotOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h2>Stacking 작업일지 등록</h2>
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
          editableRanges={Object.keys(namedRanges).filter(name => !COMMON_READONLY_FIELDS.includes(name))}
          cellValues={formValues}
          namedRanges={namedRanges}
          onCellChange={handleCellChange}
          multilineFields={['remark']}
          timeFields={['jr1WorkTime', 'jr2WorkTime', 'jr3WorkTime', 'jr4WorkTime']}
          numericFields={STACKING_NUMERIC_FIELDS}
          integerFields={STACKING_INTEGER_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...SEPARATOR_AUTO_FILL_FIELDS, ...AUTO_CALC_FIELDS]}
          selectFields={selectFields}
          dateFields={['manufactureDate']}
          tooltips={fieldTooltips}
          formulaRefs={formulaRefs}
        />
      </div>
    </div>
  );
}
