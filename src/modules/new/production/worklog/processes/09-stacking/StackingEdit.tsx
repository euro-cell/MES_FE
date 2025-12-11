import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getStackingWorklog, updateStackingWorklog } from './StackingService';
import type { StackingWorklog, StackingWorklogPayload } from './StackingTypes';
import styles from '../../../../../../styles/production/worklog/StackingEdit.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';

export default function StackingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Stacking');
  const [worklog, setWorklog] = useState<StackingWorklog | null>(null);
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
        const data = await getStackingWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);
        const values = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? '']));
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

    const payload: StackingWorklogPayload = {
      workDate: formValues.workDate || '',
      round: Number(formValues.round) || 0,
      separatorLot: formValues.separatorLot,
      separatorManufacturer: formValues.separatorManufacturer,
      separatorSpec: formValues.separatorSpec,
      separatorInputQuantity: formValues.separatorInputQuantity ? Number(formValues.separatorInputQuantity) : undefined,
      separatorUsage: formValues.separatorUsage ? Number(formValues.separatorUsage) : undefined,
      cathodeMagazineLot1: formValues.cathodeMagazineLot1,
      cathodeMagazineLot2: formValues.cathodeMagazineLot2,
      cathodeMagazineLot3: formValues.cathodeMagazineLot3,
      anodeMagazineLot1: formValues.anodeMagazineLot1,
      anodeMagazineLot2: formValues.anodeMagazineLot2,
      anodeMagazineLot3: formValues.anodeMagazineLot3,
      stackActualInput: formValues.stackActualInput ? Number(formValues.stackActualInput) : undefined,
      stackGoodQuantity: formValues.stackGoodQuantity ? Number(formValues.stackGoodQuantity) : undefined,
      stackDefectQuantity: formValues.stackDefectQuantity ? Number(formValues.stackDefectQuantity) : undefined,
      stackDiscardQuantity: formValues.stackDiscardQuantity ? Number(formValues.stackDiscardQuantity) : undefined,
      stackDefectRate: formValues.stackDefectRate ? Number(formValues.stackDefectRate) : undefined,
      hipot1ActualInput: formValues.hipot1ActualInput ? Number(formValues.hipot1ActualInput) : undefined,
      hipot1GoodQuantity: formValues.hipot1GoodQuantity ? Number(formValues.hipot1GoodQuantity) : undefined,
      hipot1DefectQuantity: formValues.hipot1DefectQuantity ? Number(formValues.hipot1DefectQuantity) : undefined,
      hipot1DiscardQuantity: formValues.hipot1DiscardQuantity ? Number(formValues.hipot1DiscardQuantity) : undefined,
      hipot1DefectRate: formValues.hipot1DefectRate ? Number(formValues.hipot1DefectRate) : undefined,
      jr1Range: formValues.jr1Range,
      jr1CathodeLot: formValues.jr1CathodeLot,
      jr1AnodeLot: formValues.jr1AnodeLot,
      jr1SeparatorLot: formValues.jr1SeparatorLot,
      jr1WorkTime: formValues.jr1WorkTime,
      jr1ElectrodeDefect: formValues.jr1ElectrodeDefect ? Number(formValues.jr1ElectrodeDefect) : undefined,
      jr2Range: formValues.jr2Range,
      jr2CathodeLot: formValues.jr2CathodeLot,
      jr2AnodeLot: formValues.jr2AnodeLot,
      jr2SeparatorLot: formValues.jr2SeparatorLot,
      jr2WorkTime: formValues.jr2WorkTime,
      jr2ElectrodeDefect: formValues.jr2ElectrodeDefect ? Number(formValues.jr2ElectrodeDefect) : undefined,
      jr3Range: formValues.jr3Range,
      jr3CathodeLot: formValues.jr3CathodeLot,
      jr3AnodeLot: formValues.jr3AnodeLot,
      jr3SeparatorLot: formValues.jr3SeparatorLot,
      jr3WorkTime: formValues.jr3WorkTime,
      jr3ElectrodeDefect: formValues.jr3ElectrodeDefect ? Number(formValues.jr3ElectrodeDefect) : undefined,
      jr4Range: formValues.jr4Range,
      jr4CathodeLot: formValues.jr4CathodeLot,
      jr4AnodeLot: formValues.jr4AnodeLot,
      jr4SeparatorLot: formValues.jr4SeparatorLot,
      jr4WorkTime: formValues.jr4WorkTime,
      jr4ElectrodeDefect: formValues.jr4ElectrodeDefect ? Number(formValues.jr4ElectrodeDefect) : undefined,
      jellyRollWeight: formValues.jellyRollWeight ? Number(formValues.jellyRollWeight) : undefined,
      jellyRollThickness: formValues.jellyRollThickness ? Number(formValues.jellyRollThickness) : undefined,
      separatorTopBottomDimension: formValues.separatorTopBottomDimension
        ? Number(formValues.separatorTopBottomDimension)
        : undefined,
      stackCount: formValues.stackCount ? Number(formValues.stackCount) : undefined,
      hipotVoltage: formValues.hipotVoltage ? Number(formValues.hipotVoltage) : undefined,
    };

    setSubmitting(true);
    try {
      await updateStackingWorklog(Number(projectId), Number(worklogId), payload);
      alert('Stack 작업일지가 수정되었습니다.');
      navigate(`/prod/log/${projectId}`);
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

  const editableRanges = Object.keys(namedRanges);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Stack 작업일지 수정</h2>
        {project && <div className={styles.projectName}>{project.name}</div>}
      </div>

      <ExcelRenderer
        workbook={workbook}
        editableRanges={editableRanges}
        cellValues={formValues}
        namedRanges={namedRanges}
        onCellChange={handleCellChange}
        className={styles.excelRenderer}
      />

      <div className={styles.actions}>
        <button className={styles.btnCancel} onClick={() => navigate(`/prod/log/${projectId}`)}>
          취소
        </button>
        <button className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '수정 중...' : '수정'}
        </button>
      </div>
    </div>
  );
}
