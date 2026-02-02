import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { useProjectLoader } from '../../shared/useProjectLoader';
import { useLineEquipmentLoader } from '../../shared/useLineEquipmentLoader';
import { useWorklogFormInit } from '../../shared/useWorklogFormInit';
import { useNotchingLots } from '../../shared/useNotchingLots';
import { mapFormToPayload } from '../../shared/excelUtils';
import { createVdWorklog } from '../../../../../api/project/worklog';
import type { VdWorklogPayload } from './VdTypes';
import { VD_NUMERIC_FIELDS, VD_INTEGER_FIELDS, VD_TIME_FIELDS } from '../../shared/numericFields';
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

export default function VdRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Vd');
  const { namedRanges } = useNamedRanges(workbook);

  const project = useProjectLoader(projectId);
  const { formValues, setFormValues } = useWorklogFormInit({ namedRanges, project });
  const plantEquipments = useLineEquipmentLoader(formValues.line);
  const { cathodeLots, anodeLots } = useNotchingLots(projectId);

  const [submitting, setSubmitting] = useState(false);

  // LocalStorage에서 기본값 불러오기
  useEffect(() => {
    if (Object.keys(formValues).length === 0) return;
    const defaults = loadWorklogDefaults('vd');
    if (defaults) {
      setFormValues(prev => ({ ...prev, ...defaults }));
    }
  }, [Object.keys(formValues).length > 0]);

  // 선택된 양극/음극 매거진 LOT 수집 (상부/하부 LOT 선택박스용)
  const selectedCathodeLots = [
    formValues.cathodeMagazineLot1,
    formValues.cathodeMagazineLot2,
    formValues.cathodeMagazineLot3,
    formValues.cathodeMagazineLot4,
    formValues.cathodeMagazineLot5,
  ].filter(Boolean);

  const selectedAnodeLots = [
    formValues.anodeMagazineLot1,
    formValues.anodeMagazineLot2,
    formValues.anodeMagazineLot3,
    formValues.anodeMagazineLot4,
    formValues.anodeMagazineLot5,
  ].filter(Boolean);

  // 상부/하부 LOT 옵션 (선택된 양극 + 음극 LOT 합침)
  const selectedMagazineLots = [...new Set([...selectedCathodeLots, ...selectedAnodeLots])];

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => ({ ...prev, [rangeName]: value }));
  };

  const handleSubmit = async () => {
    if (!projectId) return;

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, VD_NUMERIC_FIELDS) as VdWorklogPayload;
      if (formValues.plant) {
        const selectedEquipment = plantEquipments.find(eq => eq.name === formValues.plant);
        payload.plant = selectedEquipment?.id ?? null;
      }
      await createVdWorklog(Number(projectId), payload);
      // 저장 성공 시 기본값 저장
      saveWorklogDefaults('vd', formValues);
      saveWorklogAllFields('vd', formValues);
      alert('VD 작업일지가 등록되었습니다.');
      navigate(`/project/log/${projectId}?category=Assembly&process=VD`);
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 실패: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  // 이전 내용 불러오기
  const handleLoadPrevious = () => {
    const savedFields = loadWorklogAllFields('vd');
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

  const selectFields: Record<string, string[]> = {
    line: LINE_OPTIONS,
    ...(plantOptions.length > 0 && { plant: plantOptions }),
    // 양극 매거진 LOT (cathodeMagazineLot1~5)
    ...(cathodeLots.length > 0 && {
      cathodeMagazineLot1: cathodeLots,
      cathodeMagazineLot2: cathodeLots,
      cathodeMagazineLot3: cathodeLots,
      cathodeMagazineLot4: cathodeLots,
      cathodeMagazineLot5: cathodeLots,
    }),
    // 음극 매거진 LOT (anodeMagazineLot1~5)
    ...(anodeLots.length > 0 && {
      anodeMagazineLot1: anodeLots,
      anodeMagazineLot2: anodeLots,
      anodeMagazineLot3: anodeLots,
      anodeMagazineLot4: anodeLots,
      anodeMagazineLot5: anodeLots,
    }),
    // 생산 정보 - 상부/하부 LOT (선택된 매거진 LOT에서 선택)
    ...(selectedMagazineLots.length > 0 && {
      upperLot1: selectedMagazineLots,
      upperLot2: selectedMagazineLots,
      upperLot3: selectedMagazineLots,
      upperLot4: selectedMagazineLots,
      upperLot5: selectedMagazineLots,
      lowerLot1: selectedMagazineLots,
      lowerLot2: selectedMagazineLots,
      lowerLot3: selectedMagazineLots,
      lowerLot4: selectedMagazineLots,
      lowerLot5: selectedMagazineLots,
    }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h2>VD 작업일지 등록</h2>
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
            onClick={() => navigate(`/project/log/${projectId}?category=Assembly&process=VD`)}
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
        numericFields={VD_NUMERIC_FIELDS}
        integerFields={VD_INTEGER_FIELDS}
        readOnlyFields={COMMON_READONLY_FIELDS}
        selectFields={selectFields}
        dateFields={['manufactureDate']}
        timeFields={VD_TIME_FIELDS}
      />
    </div>
  );
}
