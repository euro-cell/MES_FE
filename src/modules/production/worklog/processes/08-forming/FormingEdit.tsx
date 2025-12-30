import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getFormingWorklog, updateFormingWorklog } from './FormingService';
import type { FormingWorklog, FormingWorklogPayload } from './FormingTypes';
import styles from '../../../../../styles/production/worklog/common.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';
import { FORMING_NUMERIC_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';

export default function FormingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Forming');
  const [worklog, setWorklog] = useState<FormingWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [namedRanges, setNamedRanges] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<WorklogProject | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        const proj = await getProject(Number(projectId));
        setProject(proj);
      }
    };
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (workbook) {
      const ranges = extractNamedRanges(workbook);
      setNamedRanges(ranges);
    }
  }, [workbook]);

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId) return;

      try {
        const data = await getFormingWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        const values: Record<string, any> = {
          workDate: data.workDate,
          round: data.round,

          // A. 자재 투입 정보
          pouchLot: data.pouchLot ?? '',
          pouchManufacturer: data.pouchManufacturer ?? '',
          pouchSpec: data.pouchSpec ?? '',
          pouchUsage: data.pouchUsage ?? '',

          // B. 생산 정보 - 컷팅
          cuttingWorkQuantity: data.cuttingWorkQuantity ?? '',
          cuttingGoodQuantity: data.cuttingGoodQuantity ?? '',
          cuttingDefectQuantity: data.cuttingDefectQuantity ?? '',
          cuttingDiscardQuantity: data.cuttingDiscardQuantity ?? '',
          cuttingDefectRate: data.cuttingDefectRate ?? '',

          // B. 생산 정보 - 포밍
          formingWorkQuantity: data.formingWorkQuantity ?? '',
          formingGoodQuantity: data.formingGoodQuantity ?? '',
          formingDefectQuantity: data.formingDefectQuantity ?? '',
          formingDiscardQuantity: data.formingDiscardQuantity ?? '',
          formingDefectRate: data.formingDefectRate ?? '',

          // B. 생산 정보 - 폴딩
          foldingWorkQuantity: data.foldingWorkQuantity ?? '',
          foldingGoodQuantity: data.foldingGoodQuantity ?? '',
          foldingDefectQuantity: data.foldingDefectQuantity ?? '',
          foldingDiscardQuantity: data.foldingDiscardQuantity ?? '',
          foldingDefectRate: data.foldingDefectRate ?? '',

          // B. 생산 정보 - 탑컷팅
          topCuttingWorkQuantity: data.topCuttingWorkQuantity ?? '',
          topCuttingGoodQuantity: data.topCuttingGoodQuantity ?? '',
          topCuttingDefectQuantity: data.topCuttingDefectQuantity ?? '',
          topCuttingDiscardQuantity: data.topCuttingDiscardQuantity ?? '',
          topCuttingDefectRate: data.topCuttingDefectRate ?? '',

          // C. 공정 조건
          cuttingLength: data.cuttingLength ?? '',
          cuttingChecklist: data.cuttingChecklist ?? '',
          formingDepth: data.formingDepth ?? '',
          formingStopperHeight: data.formingStopperHeight ?? '',
          formingChecklist: data.formingChecklist ?? '',
          topCuttingLength: data.topCuttingLength ?? '',
          topCuttingChecklist: data.topCuttingChecklist ?? '',
        };

        setFormValues(values);
      } catch (err) {
        console.error('작업일지 조회 실패:', err);
        alert('작업일지를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId]);

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => ({ ...prev, [rangeName]: value }));
  };

  const handleSubmit = async () => {
    if (!projectId || !worklogId) return;

    const payload: FormingWorklogPayload = {
      workDate: formValues.workDate || '',
      round: Number(formValues.round) || 0,

      // A. 자재 투입 정보
      pouchLot: formValues.pouchLot,
      pouchManufacturer: formValues.pouchManufacturer,
      pouchSpec: formValues.pouchSpec,
      pouchUsage: formValues.pouchUsage ? Number(formValues.pouchUsage) : undefined,

      // B. 생산 정보 - 컷팅
      cuttingWorkQuantity: formValues.cuttingWorkQuantity ? Number(formValues.cuttingWorkQuantity) : undefined,
      cuttingGoodQuantity: formValues.cuttingGoodQuantity ? Number(formValues.cuttingGoodQuantity) : undefined,
      cuttingDefectQuantity: formValues.cuttingDefectQuantity ? Number(formValues.cuttingDefectQuantity) : undefined,
      cuttingDiscardQuantity: formValues.cuttingDiscardQuantity ? Number(formValues.cuttingDiscardQuantity) : undefined,
      cuttingDefectRate: formValues.cuttingDefectRate ? Number(formValues.cuttingDefectRate) : undefined,

      // B. 생산 정보 - 포밍
      formingWorkQuantity: formValues.formingWorkQuantity ? Number(formValues.formingWorkQuantity) : undefined,
      formingGoodQuantity: formValues.formingGoodQuantity ? Number(formValues.formingGoodQuantity) : undefined,
      formingDefectQuantity: formValues.formingDefectQuantity ? Number(formValues.formingDefectQuantity) : undefined,
      formingDiscardQuantity: formValues.formingDiscardQuantity ? Number(formValues.formingDiscardQuantity) : undefined,
      formingDefectRate: formValues.formingDefectRate ? Number(formValues.formingDefectRate) : undefined,

      // B. 생산 정보 - 폴딩
      foldingWorkQuantity: formValues.foldingWorkQuantity ? Number(formValues.foldingWorkQuantity) : undefined,
      foldingGoodQuantity: formValues.foldingGoodQuantity ? Number(formValues.foldingGoodQuantity) : undefined,
      foldingDefectQuantity: formValues.foldingDefectQuantity ? Number(formValues.foldingDefectQuantity) : undefined,
      foldingDiscardQuantity: formValues.foldingDiscardQuantity ? Number(formValues.foldingDiscardQuantity) : undefined,
      foldingDefectRate: formValues.foldingDefectRate ? Number(formValues.foldingDefectRate) : undefined,

      // B. 생산 정보 - 탑컷팅
      topCuttingWorkQuantity: formValues.topCuttingWorkQuantity ? Number(formValues.topCuttingWorkQuantity) : undefined,
      topCuttingGoodQuantity: formValues.topCuttingGoodQuantity ? Number(formValues.topCuttingGoodQuantity) : undefined,
      topCuttingDefectQuantity: formValues.topCuttingDefectQuantity ? Number(formValues.topCuttingDefectQuantity) : undefined,
      topCuttingDiscardQuantity: formValues.topCuttingDiscardQuantity ? Number(formValues.topCuttingDiscardQuantity) : undefined,
      topCuttingDefectRate: formValues.topCuttingDefectRate ? Number(formValues.topCuttingDefectRate) : undefined,

      // C. 공정 조건 - 컷팅
      cuttingLength: formValues.cuttingLength ? Number(formValues.cuttingLength) : undefined,
      cuttingChecklist: formValues.cuttingChecklist,

      // C. 공정 조건 - 포밍
      formingDepth: formValues.formingDepth ? Number(formValues.formingDepth) : undefined,
      formingStopperHeight: formValues.formingStopperHeight ? Number(formValues.formingStopperHeight) : undefined,
      formingChecklist: formValues.formingChecklist,

      // C. 공정 조건 - 탑컷팅
      topCuttingLength: formValues.topCuttingLength ? Number(formValues.topCuttingLength) : undefined,
      topCuttingChecklist: formValues.topCuttingChecklist,
    };

    setSubmitting(true);
    try {
      await updateFormingWorklog(Number(projectId), Number(worklogId), payload);
      alert('Forming 작업일지가 수정되었습니다.');
      navigate(`/prod/log/${projectId}?category=Assembly&process=Forming`);
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정 실패: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (templateLoading || loading) return <p>데이터를 불러오는 중...</p>;
  if (templateError) return <p>템플릿 로드 실패: {templateError.message}</p>;
  if (!workbook || !worklog) return <p>데이터를 불러올 수 없습니다.</p>;

  const editableRanges = Object.keys(namedRanges).filter(name => !COMMON_READONLY_FIELDS.includes(name));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Forming 작업일지 수정</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
        </div>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={() => navigate(`/prod/log/${projectId}?category=Assembly&process=Forming`)}>
            취소
          </button>
          <button className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '수정 중...' : '수정'}
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
        readOnlyFields={COMMON_READONLY_FIELDS}
      />
    </div>
  );
}
