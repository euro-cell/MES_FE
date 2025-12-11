import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { createStackingWorklog } from './StackingService';
import type { StackingWorklogPayload } from './StackingTypes';
import styles from '../../../../../../styles/production/worklog/StackingRegister.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';

export default function StackingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading, error } = useExcelTemplate('Stacking');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [namedRanges, setNamedRanges] = useState<Record<string, any>>({});
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
    if (Object.keys(namedRanges).length > 0) {
      const initialValues: Record<string, any> = {};
      Object.keys(namedRanges).forEach(rangeName => {
        if (rangeName === 'productionId' && project) {
          initialValues[rangeName] = project.name;
        } else {
          initialValues[rangeName] = '';
        }
      });
      setFormValues(initialValues);
    }
  }, [namedRanges, project]);

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => ({ ...prev, [rangeName]: value }));
  };

  const handleSubmit = async () => {
    if (!projectId) return;

    const payload: StackingWorklogPayload = {
      workDate: formValues.workDate || '',
      round: Number(formValues.round) || 0,

      // A. 자재 투입 정보
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

      // B. 생산 정보
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

      // C. 공정 조건
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
      await createStackingWorklog(Number(projectId), payload);
      alert('Stack 작업일지가 등록되었습니다.');
      navigate(`/prod/log/${projectId}`);
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 실패: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>템플릿을 불러오는 중...</p>;
  if (error) return <p>템플릿 로드 실패: {error.message}</p>;
  if (!workbook) return <p>엑셀 데이터를 불러올 수 없습니다.</p>;

  const editableRanges = Object.keys(namedRanges);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Stack 작업일지 등록</h2>
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
          {submitting ? '등록 중...' : '등록'}
        </button>
      </div>
    </div>
  );
}
