import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { mapFormToPayload } from '../../shared/excelUtils';
import { createNotchingWorklog } from '../../../../../api/project/worklog';
import type { NotchingWorklogPayload } from './NotchingTypes';
import { NOTCHING_NUMERIC_FIELDS, NOTCHING_INTEGER_FIELDS } from '../../shared/numericFields';
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
// 자동입력 필드 (양품 수량 = 타발 수량 - 불량 수량)
const NOTCHING_AUTO_FILL_FIELDS = ['goodQuantity1', 'goodQuantity2', 'goodQuantity3', 'goodQuantity4', 'goodQuantity5'];

export default function NotchingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Notching');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);

  const [submitting, setSubmitting] = useState(false);

  // LocalStorage에서 기본값 불러오기
  useEffect(() => {
    if (Object.keys(formValues).length === 0) return;
    const defaults = loadWorklogDefaults('notching');
    if (defaults) {
      setFormValues(prev => ({ ...prev, ...defaults }));
    }
  }, [Object.keys(formValues).length > 0]);

  // 자동계산 필드 툴팁 생성
  const fieldTooltips = useMemo(() => {
    const tips: Record<string, string> = {};
    for (let i = 1; i <= 5; i++) {
      tips[`goodQuantity${i}`] = `= 타발 수량${i} - 불량 수량${i}`;
    }
    return tips;
  }, []);

  // 수식 참조 정보 (호버 시 셀 하이라이트용)
  const formulaRefs = useMemo(() => {
    const COLORS = { blue: '#2196F3', green: '#4CAF50' };
    const refs: Record<string, { formula: string; refs: { field: string; label: string; color: string }[] }> = {};
    for (let i = 1; i <= 5; i++) {
      refs[`goodQuantity${i}`] = {
        formula: `= 타발 수량${i} - 불량 수량${i}`,
        refs: [
          { field: `notchingQuantity${i}`, label: `타발 수량${i}`, color: COLORS.blue },
          { field: `defectQuantity${i}`, label: `불량 수량${i}`, color: COLORS.green },
        ],
      };
    }
    return refs;
  }, []);

  // 양품 수량 자동계산 (타발 수량 - 불량 수량)
  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => {
      const newValues = { ...prev, [rangeName]: value };

      // notchingQuantity 또는 defectQuantity 변경 시 goodQuantity 자동계산
      for (let i = 1; i <= 5; i++) {
        if (rangeName === `notchingQuantity${i}` || rangeName === `defectQuantity${i}`) {
          const notching = parseInt(newValues[`notchingQuantity${i}`]) || 0;
          const defect = parseInt(newValues[`defectQuantity${i}`]) || 0;
          newValues[`goodQuantity${i}`] = notching - defect;
        }
      }

      return newValues;
    });
  };

  const handleSubmit = async () => {
    if (!projectId) return;

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, NOTCHING_NUMERIC_FIELDS) as NotchingWorklogPayload;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createNotchingWorklog(Number(projectId), payload);
      // 저장 성공 시 기본값 저장
      saveWorklogDefaults('notching', formValues);
      saveWorklogAllFields('notching', formValues);
      alert('Notching 작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Electrode&process=Notching`);
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 실패: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  // 이전 내용 불러오기
  const handleLoadPrevious = () => {
    const savedFields = loadWorklogAllFields('notching');
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

  const editableRanges = Object.keys(namedRanges).filter(
    name => ![...COMMON_READONLY_FIELDS, ...NOTCHING_AUTO_FILL_FIELDS].includes(name),
  );
  const plantOptions = plantEquipments.map(eq => eq.name);

  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h2>Notching 작업일지 등록</h2>
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
            onClick={() => navigate(`/project/log/${projectId}?category=Electrode&process=Notching`)}
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
        numericFields={NOTCHING_NUMERIC_FIELDS}
        integerFields={NOTCHING_INTEGER_FIELDS}
        readOnlyFields={[...COMMON_READONLY_FIELDS, ...NOTCHING_AUTO_FILL_FIELDS]}
        selectFields={selectFields}
        dateFields={['manufactureDate']}
        multilineFields={['remark']}
        tooltips={fieldTooltips}
        formulaRefs={formulaRefs}
      />
    </div>
  );
}
