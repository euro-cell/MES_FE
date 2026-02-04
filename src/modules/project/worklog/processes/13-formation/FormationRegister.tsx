import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { mapFormToPayload } from '../../shared/excelUtils';
import { FORMATION_NUMERIC_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import {
  saveWorklogDefaults,
  loadWorklogDefaults,
  saveWorklogAllFields,
  loadWorklogAllFields,
} from '../../shared/worklogDefaults';
import { createFormationWorklog } from '../../../../../api/project/worklog';
import type { FormationWorklogPayload } from './FormationTypes';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';
import toast from 'react-hot-toast';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
const UNIT_NUMBER_OPTIONS = ['11호기', '12호기', '13호기', '14호기', '15호기', '16호기'];

// 자동계산 필드 (양품 수량, 불량률)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (투입 수량 - 불량 수량)
  'degas1GoodQuantity',
  'preFormationGoodQuantity',
  'degas2GoodQuantity',
  'cellPressGoodQuantity',
  'finalSealingGoodQuantity',
  'lotMarkingGoodQuantity',
  'mainFormationGoodQuantity',
  'ocv1GoodQuantity',
  // 불량률 (불량 수량 / 투입 수량 * 100)
  'degas1DefectRate',
  'preFormationDefectRate',
  'degas2DefectRate',
  'cellPressDefectRate',
  'finalSealingDefectRate',
  'lotMarkingDefectRate',
  'mainFormationDefectRate',
  'ocv1DefectRate',
];

export default function FormationRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('formation');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);

  const [saving, setSaving] = useState(false);

  // LocalStorage에서 기본값 불러오기
  useEffect(() => {
    if (Object.keys(formValues).length === 0) return;
    const defaults = loadWorklogDefaults('formation');
    if (defaults) {
      setFormValues(prev => ({ ...prev, ...defaults }));
    }
  }, [Object.keys(formValues).length > 0]);

  // 양품 수량 및 불량률 자동계산 함수
  const calculateAutoFields = (prev: Record<string, any>, rangeName: string, value: any): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량, 불량률 계산
    const processes = ['degas1', 'preFormation', 'degas2', 'cellPress', 'finalSealing', 'lotMarking', 'mainFormation', 'ocv1'];
    for (const process of processes) {
      const inputField = `${process}InputQuantity`;
      const defectField = `${process}DefectQuantity`;
      const goodField = `${process}GoodQuantity`;
      const defectRateField = `${process}DefectRate`;

      if (rangeName === inputField || rangeName === defectField) {
        const inputQty = rangeName === inputField ? value || 0 : prev[inputField] || 0;
        const defectQty = rangeName === defectField ? value || 0 : prev[defectField] || 0;
        // 양품 수량 = 투입 수량 - 불량 수량
        updates[goodField] = Math.max(0, Number(inputQty) - Number(defectQty));
        // 불량률 = (불량 수량 / 투입 수량) * 100
        updates[defectRateField] =
          Number(inputQty) > 0 ? Math.round((Number(defectQty) / Number(inputQty)) * 10000) / 100 : 0;
      }
    }

    return updates;
  };

  // 자동계산 필드 툴팁 생성
  const fieldTooltips = useMemo(() => {
    const tips: Record<string, string> = {};
    const processes = ['degas1', 'preFormation', 'degas2', 'cellPress', 'finalSealing', 'lotMarking', 'mainFormation', 'ocv1'];
    const processLabels: Record<string, string> = {
      degas1: 'Degas1',
      preFormation: 'Pre-Formation',
      degas2: 'Degas2',
      cellPress: 'Cell Press',
      finalSealing: 'Final Sealing',
      lotMarking: 'Lot Marking',
      mainFormation: 'Main Formation',
      ocv1: 'OCV1',
    };

    processes.forEach(process => {
      const label = processLabels[process];
      tips[`${process}GoodQuantity`] = `= ${label} 투입 수량 - ${label} 불량 수량`;
      tips[`${process}DefectRate`] = `= (${label} 불량 수량 / ${label} 투입 수량) × 100`;
    });

    return tips;
  }, []);

  // 수식 참조 정보 (호버 시 셀 하이라이트용)
  const formulaRefs = useMemo(() => {
    const COLORS = {
      blue: '#2196F3',
      green: '#4CAF50',
      orange: '#FF9800',
    };

    const refs: Record<string, { formula: string; refs: { field: string; label: string; color: string }[] }> = {};
    const processes = ['degas1', 'preFormation', 'degas2', 'cellPress', 'finalSealing', 'lotMarking', 'mainFormation', 'ocv1'];
    const processLabels: Record<string, string> = {
      degas1: 'Degas1',
      preFormation: 'Pre-Formation',
      degas2: 'Degas2',
      cellPress: 'Cell Press',
      finalSealing: 'Final Sealing',
      lotMarking: 'Lot Marking',
      mainFormation: 'Main Formation',
      ocv1: 'OCV1',
    };

    processes.forEach(process => {
      const label = processLabels[process];
      // 양품 수량 수식 참조
      refs[`${process}GoodQuantity`] = {
        formula: `= ${label} 투입 수량 - ${label} 불량 수량`,
        refs: [
          { field: `${process}InputQuantity`, label: `${label} 투입 수량`, color: COLORS.blue },
          { field: `${process}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.green },
        ],
      };
      // 불량률 수식 참조
      refs[`${process}DefectRate`] = {
        formula: `= (${label} 불량 수량 / ${label} 투입 수량) × 100`,
        refs: [
          { field: `${process}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.blue },
          { field: `${process}InputQuantity`, label: `${label} 투입 수량`, color: COLORS.green },
        ],
      };
    });

    return refs;
  }, []);

  // 셀 값 변경 핸들러 (자동계산 포함)
  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      ...calculateAutoFields(prev, rangeName, value),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, FORMATION_NUMERIC_FIELDS) as FormationWorklogPayload;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createFormationWorklog(Number(projectId), payload);
      // 저장 성공 시 기본값 저장
      saveWorklogDefaults('formation', formValues);
      saveWorklogAllFields('formation', formValues);
      alert('작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Formation&process=Formation`);
    } catch (err) {
      alert('저장 실패: ' + err);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('입력한 내용이 사라집니다. 취소하시겠습니까?')) {
      navigate(`/project/log/${projectId}?category=Formation&process=Formation`);
    }
  };

  // 이전 내용 불러오기
  const handleLoadPrevious = () => {
    const savedFields = loadWorklogAllFields('formation');
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
  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    preFormation1UnitNumber: UNIT_NUMBER_OPTIONS,
    preFormation2UnitNumber: UNIT_NUMBER_OPTIONS,
    preFormation3UnitNumber: UNIT_NUMBER_OPTIONS,
    preFormation4UnitNumber: UNIT_NUMBER_OPTIONS,
    preFormation5UnitNumber: UNIT_NUMBER_OPTIONS,
    mainFormation1UnitNumber: UNIT_NUMBER_OPTIONS,
    mainFormation2UnitNumber: UNIT_NUMBER_OPTIONS,
    mainFormation3UnitNumber: UNIT_NUMBER_OPTIONS,
    mainFormation4UnitNumber: UNIT_NUMBER_OPTIONS,
    mainFormation5UnitNumber: UNIT_NUMBER_OPTIONS,
  };

  // 커스텀 placeholder 설정
  const placeholders: Record<string, string> = {
    preFormation1Quantity: '양품 수량',
    preFormation2Quantity: '양품 수량',
    preFormation3Quantity: '양품 수량',
    preFormation4Quantity: '양품 수량',
    preFormation5Quantity: '양품 수량',
    preFormation1CellNumberRange: '예: 1-5, 8, 10-15',
    preFormation2CellNumberRange: '예: 1-5, 8, 10-15',
    preFormation3CellNumberRange: '예: 1-5, 8, 10-15',
    preFormation4CellNumberRange: '예: 1-5, 8, 10-15',
    preFormation5CellNumberRange: '예: 1-5, 8, 10-15',
    mainFormation1Quantity: '양품 수량',
    mainFormation2Quantity: '양품 수량',
    mainFormation3Quantity: '양품 수량',
    mainFormation4Quantity: '양품 수량',
    mainFormation5Quantity: '양품 수량',
    mainFormation1CellNumberRange: '예: 1-5, 8, 10-15',
    mainFormation2CellNumberRange: '예: 1-5, 8, 10-15',
    mainFormation3CellNumberRange: '예: 1-5, 8, 10-15',
    mainFormation4CellNumberRange: '예: 1-5, 8, 10-15',
    mainFormation5CellNumberRange: '예: 1-5, 8, 10-15',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h2>Formation 작업일지 등록</h2>
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
          numericFields={FORMATION_NUMERIC_FIELDS}
          readOnlyFields={[...COMMON_READONLY_FIELDS, ...AUTO_CALC_FIELDS]}
          selectFields={selectFields}
          dateFields={['manufactureDate']}
          placeholders={placeholders}
          tooltips={fieldTooltips}
          formulaRefs={formulaRefs}
        />
      </div>
    </div>
  );
}
