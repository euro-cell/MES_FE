import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { usePouchLots } from '../../shared/usePouchLots';
import { mapFormToPayload } from '../../shared/excelUtils';
import { createFormingWorklog } from '../../../../../api/project/worklog';
import type { FormingWorklogPayload } from './FormingTypes';
import { FORMING_NUMERIC_FIELDS, FORMING_INTEGER_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';
import {
  saveWorklogDefaults,
  loadWorklogDefaults,
  saveWorklogAllFields,
  loadWorklogAllFields,
} from '../../shared/worklogDefaults';
import type { CategoryLabel } from '../../shared/processCategories';
import styles from '../../../../../styles/project/worklog/common.module.css';
import toast from 'react-hot-toast';

const LINE_OPTIONS: CategoryLabel[] = ['전극', '조립', '화성'];
// 자동입력 필드 (파우치 LOT 선택 시 제조사, 스팩 자동 입력)
const POUCH_AUTO_FILL_FIELDS = ['pouchManufacturer', 'pouchSpec'];
// 자동계산 필드 (양품 수량, 불량률)
const AUTO_CALC_FIELDS = [
  // 양품 수량 (작업 수량 - 불량 수량)
  'cuttingGoodQuantity',
  'formingGoodQuantity',
  'foldingGoodQuantity',
  'topCuttingGoodQuantity',
  // 불량률 (불량 수량 / 작업 수량 * 100)
  'cuttingDefectRate',
  'formingDefectRate',
  'foldingDefectRate',
  'topCuttingDefectRate',
];

export default function FormingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Forming');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { pouchLots } = usePouchLots();

  const [submitting, setSubmitting] = useState(false);

  // 자동계산 필드 툴팁
  const fieldTooltips = useMemo(() => {
    const tips: Record<string, string> = {};
    const processes = [
      { key: 'cutting', label: '컷팅' },
      { key: 'forming', label: '포밍' },
      { key: 'folding', label: '폴딩' },
      { key: 'topCutting', label: '탑컷팅' },
    ];
    for (const { key, label } of processes) {
      tips[`${key}GoodQuantity`] = `= ${label} 작업 수량 - ${label} 불량 수량`;
      tips[`${key}DefectRate`] = `= (${label} 불량 수량 / ${label} 작업 수량) × 100`;
    }
    return tips;
  }, []);

  // 자동계산 필드 참조 (하이라이트용)
  const formulaRefs = useMemo(() => {
    const COLORS = { blue: '#2196F3', green: '#4CAF50', orange: '#FF9800' };
    const refs: Record<string, { formula: string; refs: { field: string; label: string; color: string }[] }> = {};
    const processes = [
      { key: 'cutting', label: '컷팅' },
      { key: 'forming', label: '포밍' },
      { key: 'folding', label: '폴딩' },
      { key: 'topCutting', label: '탑컷팅' },
    ];
    for (const { key, label } of processes) {
      refs[`${key}GoodQuantity`] = {
        formula: `= ${label} 작업 수량 - ${label} 불량 수량`,
        refs: [
          { field: `${key}WorkQuantity`, label: `${label} 작업 수량`, color: COLORS.blue },
          { field: `${key}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.green },
        ],
      };
      refs[`${key}DefectRate`] = {
        formula: `= (${label} 불량 수량 / ${label} 작업 수량) × 100`,
        refs: [
          { field: `${key}DefectQuantity`, label: `${label} 불량 수량`, color: COLORS.blue },
          { field: `${key}WorkQuantity`, label: `${label} 작업 수량`, color: COLORS.green },
        ],
      };
    }
    return refs;
  }, []);

  // LocalStorage에서 기본값 불러오기
  useEffect(() => {
    if (Object.keys(formValues).length === 0) return;
    const defaults = loadWorklogDefaults('forming');
    if (defaults) {
      setFormValues(prev => ({ ...prev, ...defaults }));
    }
  }, [Object.keys(formValues).length > 0]);

  // 양품 수량 및 불량률 자동계산 헬퍼 함수
  const calculateAutoFields = (prev: Record<string, any>, rangeName: string, value: any): Record<string, any> => {
    const updates: Record<string, any> = { [rangeName]: value };

    // 각 공정별 양품 수량, 불량률 계산
    const processes = ['cutting', 'forming', 'folding', 'topCutting'];
    for (const process of processes) {
      const workField = `${process}WorkQuantity`;
      const defectField = `${process}DefectQuantity`;
      const goodField = `${process}GoodQuantity`;
      const defectRateField = `${process}DefectRate`;

      if (rangeName === workField || rangeName === defectField) {
        const workQty = rangeName === workField ? value || 0 : prev[workField] || 0;
        const defectQty = rangeName === defectField ? value || 0 : prev[defectField] || 0;
        // 양품 수량 = 작업 수량 - 불량 수량
        updates[goodField] = Math.max(0, Number(workQty) - Number(defectQty));
        // 불량률 = (불량 수량 / 작업 수량) * 100
        updates[defectRateField] =
          Number(workQty) > 0 ? Math.round((Number(defectQty) / Number(workQty)) * 10000) / 100 : 0;
      }
    }

    return updates;
  };

  // 파우치 LOT 선택 시 제조사, 스팩 자동 입력 + 양품 수량 자동계산
  const handleCellChange = (rangeName: string, value: any) => {
    if (rangeName === 'pouchLot') {
      const firstLot = typeof value === 'string' ? value.split(',')[0].trim() : value;
      const selectedPouch = pouchLots.find(p => p.lot === firstLot);
      setFormValues(prev => ({
        ...prev,
        [rangeName]: value,
        pouchManufacturer: selectedPouch?.manufacturer || '',
        pouchSpec: selectedPouch?.spec || '',
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        ...calculateAutoFields(prev, rangeName, value),
      }));
    }
  };

  const handleSubmit = async () => {
    if (!projectId) return;

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, FORMING_NUMERIC_FIELDS) as FormingWorklogPayload;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createFormingWorklog(Number(projectId), payload);
      // 저장 성공 시 기본값 저장
      saveWorklogDefaults('forming', formValues);
      saveWorklogAllFields('forming', formValues);
      alert('Forming 작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=Forming`);
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 실패: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  // 이전 내용 불러오기
  const handleLoadPrevious = () => {
    const savedFields = loadWorklogAllFields('forming');
    if (savedFields) {
      setFormValues(prev => ({ ...prev, ...savedFields }));
      toast.success('이전 등록 내용을 불러왔습니다.');
    } else {
      toast.error('저장된 이전 내용이 없습니다.');
    }
  };

  if (templateLoading) return <p>템플릿을 불러오는 중...</p>;
  if (templateError) return <p>템플릿 로드 실패: {templateError.message}</p>;
  if (!workbook) return <p>엑셀 데이터를 불러올 수 없습니다.</p>;

  const editableRanges = Object.keys(namedRanges).filter(name => !COMMON_READONLY_FIELDS.includes(name));
  const plantOptions = plantEquipments.map(eq => eq.name);
  const pouchLotOptions = pouchLots.map(p => p.lot);

  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
  };
  const multiSelectFields: Record<string, string[]> = {
    ...(pouchLotOptions.length > 0 && { pouchLot: pouchLotOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h2>Forming 작업일지 등록</h2>
            {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
            <p className={styles.hint}>파란색: 입력 / 연두색: 선택 / 노란색: 자동입력</p>
          </div>
          <button
            onClick={handleLoadPrevious}
            className={styles.loadPreviousButton}
            disabled={submitting}
            title='마지막으로 저장한 작업일지 내용을 불러옵니다 (프로젝트명, 날짜, 작성자 제외)'
          >
            이전 내용 불러오기
          </button>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={() => navigate(`/project/log/${projectId}?category=Assembly&process=Forming`)}
            disabled={submitting}
          >
            취소
          </button>
          <button className={styles.saveButton} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>

      <ExcelRenderer
        workbook={workbook}
        editableRanges={editableRanges}
        cellValues={formValues}
        namedRanges={namedRanges}
        onCellChange={handleCellChange}
        className={styles.excelRenderer}
        numericFields={FORMING_NUMERIC_FIELDS}
        integerFields={FORMING_INTEGER_FIELDS}
        readOnlyFields={[...COMMON_READONLY_FIELDS, ...POUCH_AUTO_FILL_FIELDS, ...AUTO_CALC_FIELDS]}
        selectFields={selectFields}
        multiSelectFields={multiSelectFields}
        dateFields={['manufactureDate']}
        multilineFields={['remark']}
        tooltips={fieldTooltips}
        formulaRefs={formulaRefs}
      />
    </div>
  );
}
