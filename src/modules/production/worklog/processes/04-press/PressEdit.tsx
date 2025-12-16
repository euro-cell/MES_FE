import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getPressWorklog, updatePressWorklog } from './PressService';
import type { PressWorklog, PressWorklogPayload } from './PressTypes';
import styles from '../../../../../styles/production/worklog/common.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';
import { PRESS_NUMERIC_FIELDS } from '../../shared/numericFields';

export default function PressEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Press');
  const [worklog, setWorklog] = useState<PressWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [namedRanges, setNamedRanges] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<WorklogProject | null>(null);

  // 프로젝트 정보 로드
  useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        const proj = await getProject(Number(projectId));
        setProject(proj);
      }
    };
    loadProject();
  }, [projectId]);

  // Named Ranges 추출
  useEffect(() => {
    if (workbook) {
      const ranges = extractNamedRanges(workbook);
      setNamedRanges(ranges);
    }
  }, [workbook]);

  // 작업일지 데이터 로드
  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId) return;

      try {
        const data = await getPressWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        // 데이터를 formValues로 변환
        const values: Record<string, any> = {
          workDate: data.workDate,
          round: data.round,

          // A. 자재 투입 정보
          coatingRollLot1: data.coatingRollLot1 ?? '',
          coatingRollLot2: data.coatingRollLot2 ?? '',
          coatingRollLot3: data.coatingRollLot3 ?? '',
          coatingRollLot4: data.coatingRollLot4 ?? '',
          coatingRollLot5: data.coatingRollLot5 ?? '',
          targetThickness: data.targetThickness ?? '',

          // B. 생산 정보 - 1차
          coatingLot1: data.coatingLot1 ?? '',
          pressLot1: data.pressLot1 ?? '',
          coatingQuantity1: data.coatingQuantity1 ?? '',
          pressQuantity1: data.pressQuantity1 ?? '',
          weightPerAreaFront1M: data.weightPerAreaFront1M ?? '',
          weightPerAreaFront1C: data.weightPerAreaFront1C ?? '',
          weightPerAreaFront1D: data.weightPerAreaFront1D ?? '',
          weightPerAreaRear1M: data.weightPerAreaRear1M ?? '',
          weightPerAreaRear1C: data.weightPerAreaRear1C ?? '',
          weightPerAreaRear1D: data.weightPerAreaRear1D ?? '',
          thicknessFront1M: data.thicknessFront1M ?? '',
          thicknessFront1C: data.thicknessFront1C ?? '',
          thicknessFront1D: data.thicknessFront1D ?? '',
          thicknessRear1M: data.thicknessRear1M ?? '',
          thicknessRear1C: data.thicknessRear1C ?? '',
          thicknessRear1D: data.thicknessRear1D ?? '',

          // B. 생산 정보 - 2차
          coatingLot2: data.coatingLot2 ?? '',
          pressLot2: data.pressLot2 ?? '',
          coatingQuantity2: data.coatingQuantity2 ?? '',
          pressQuantity2: data.pressQuantity2 ?? '',
          weightPerAreaFront2M: data.weightPerAreaFront2M ?? '',
          weightPerAreaFront2C: data.weightPerAreaFront2C ?? '',
          weightPerAreaFront2D: data.weightPerAreaFront2D ?? '',
          weightPerAreaRear2M: data.weightPerAreaRear2M ?? '',
          weightPerAreaRear2C: data.weightPerAreaRear2C ?? '',
          weightPerAreaRear2D: data.weightPerAreaRear2D ?? '',
          thicknessFront2M: data.thicknessFront2M ?? '',
          thicknessFront2C: data.thicknessFront2C ?? '',
          thicknessFront2D: data.thicknessFront2D ?? '',
          thicknessRear2M: data.thicknessRear2M ?? '',
          thicknessRear2C: data.thicknessRear2C ?? '',
          thicknessRear2D: data.thicknessRear2D ?? '',

          // B. 생산 정보 - 3차
          coatingLot3: data.coatingLot3 ?? '',
          pressLot3: data.pressLot3 ?? '',
          coatingQuantity3: data.coatingQuantity3 ?? '',
          pressQuantity3: data.pressQuantity3 ?? '',
          weightPerAreaFront3M: data.weightPerAreaFront3M ?? '',
          weightPerAreaFront3C: data.weightPerAreaFront3C ?? '',
          weightPerAreaFront3D: data.weightPerAreaFront3D ?? '',
          weightPerAreaRear3M: data.weightPerAreaRear3M ?? '',
          weightPerAreaRear3C: data.weightPerAreaRear3C ?? '',
          weightPerAreaRear3D: data.weightPerAreaRear3D ?? '',
          thicknessFront3M: data.thicknessFront3M ?? '',
          thicknessFront3C: data.thicknessFront3C ?? '',
          thicknessFront3D: data.thicknessFront3D ?? '',
          thicknessRear3M: data.thicknessRear3M ?? '',
          thicknessRear3C: data.thicknessRear3C ?? '',
          thicknessRear3D: data.thicknessRear3D ?? '',

          // B. 생산 정보 - 4차
          coatingLot4: data.coatingLot4 ?? '',
          pressLot4: data.pressLot4 ?? '',
          coatingQuantity4: data.coatingQuantity4 ?? '',
          pressQuantity4: data.pressQuantity4 ?? '',
          weightPerAreaFront4M: data.weightPerAreaFront4M ?? '',
          weightPerAreaFront4C: data.weightPerAreaFront4C ?? '',
          weightPerAreaFront4D: data.weightPerAreaFront4D ?? '',
          weightPerAreaRear4M: data.weightPerAreaRear4M ?? '',
          weightPerAreaRear4C: data.weightPerAreaRear4C ?? '',
          weightPerAreaRear4D: data.weightPerAreaRear4D ?? '',
          thicknessFront4M: data.thicknessFront4M ?? '',
          thicknessFront4C: data.thicknessFront4C ?? '',
          thicknessFront4D: data.thicknessFront4D ?? '',
          thicknessRear4M: data.thicknessRear4M ?? '',
          thicknessRear4C: data.thicknessRear4C ?? '',
          thicknessRear4D: data.thicknessRear4D ?? '',

          // B. 생산 정보 - 5차
          coatingLot5: data.coatingLot5 ?? '',
          pressLot5: data.pressLot5 ?? '',
          coatingQuantity5: data.coatingQuantity5 ?? '',
          pressQuantity5: data.pressQuantity5 ?? '',
          weightPerAreaFront5M: data.weightPerAreaFront5M ?? '',
          weightPerAreaFront5C: data.weightPerAreaFront5C ?? '',
          weightPerAreaFront5D: data.weightPerAreaFront5D ?? '',
          weightPerAreaRear5M: data.weightPerAreaRear5M ?? '',
          weightPerAreaRear5C: data.weightPerAreaRear5C ?? '',
          weightPerAreaRear5D: data.weightPerAreaRear5D ?? '',
          thicknessFront5M: data.thicknessFront5M ?? '',
          thicknessFront5C: data.thicknessFront5C ?? '',
          thicknessFront5D: data.thicknessFront5D ?? '',
          thicknessRear5M: data.thicknessRear5M ?? '',
          thicknessRear5C: data.thicknessRear5C ?? '',
          thicknessRear5D: data.thicknessRear5D ?? '',

          // C. 공정 조건
          tensionUnT: data.tensionUnT ?? '',
          tensionReT: data.tensionReT ?? '',
          pressSpeed: data.pressSpeed ?? '',
          pressureCondition: data.pressureCondition ?? '',
          rollGapLeft: data.rollGapLeft ?? '',
          rollGapRight: data.rollGapRight ?? '',
          rollTemperatureMain: data.rollTemperatureMain ?? '',
          rollTemperatureInfeed: data.rollTemperatureInfeed ?? '',
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

    const payload: PressWorklogPayload = {
      workDate: formValues.workDate || '',
      round: Number(formValues.round) || 0,

      // A. 자재 투입 정보
      coatingRollLot1: formValues.coatingRollLot1,
      coatingRollLot2: formValues.coatingRollLot2,
      coatingRollLot3: formValues.coatingRollLot3,
      coatingRollLot4: formValues.coatingRollLot4,
      coatingRollLot5: formValues.coatingRollLot5,
      targetThickness: formValues.targetThickness ? Number(formValues.targetThickness) : undefined,

      // B. 생산 정보 - 1차
      coatingLot1: formValues.coatingLot1,
      pressLot1: formValues.pressLot1,
      coatingQuantity1: formValues.coatingQuantity1 ? Number(formValues.coatingQuantity1) : undefined,
      pressQuantity1: formValues.pressQuantity1 ? Number(formValues.pressQuantity1) : undefined,
      weightPerAreaFront1M: formValues.weightPerAreaFront1M ? Number(formValues.weightPerAreaFront1M) : undefined,
      weightPerAreaFront1C: formValues.weightPerAreaFront1C ? Number(formValues.weightPerAreaFront1C) : undefined,
      weightPerAreaFront1D: formValues.weightPerAreaFront1D ? Number(formValues.weightPerAreaFront1D) : undefined,
      weightPerAreaRear1M: formValues.weightPerAreaRear1M ? Number(formValues.weightPerAreaRear1M) : undefined,
      weightPerAreaRear1C: formValues.weightPerAreaRear1C ? Number(formValues.weightPerAreaRear1C) : undefined,
      weightPerAreaRear1D: formValues.weightPerAreaRear1D ? Number(formValues.weightPerAreaRear1D) : undefined,
      thicknessFront1M: formValues.thicknessFront1M ? Number(formValues.thicknessFront1M) : undefined,
      thicknessFront1C: formValues.thicknessFront1C ? Number(formValues.thicknessFront1C) : undefined,
      thicknessFront1D: formValues.thicknessFront1D ? Number(formValues.thicknessFront1D) : undefined,
      thicknessRear1M: formValues.thicknessRear1M ? Number(formValues.thicknessRear1M) : undefined,
      thicknessRear1C: formValues.thicknessRear1C ? Number(formValues.thicknessRear1C) : undefined,
      thicknessRear1D: formValues.thicknessRear1D ? Number(formValues.thicknessRear1D) : undefined,

      // B. 생산 정보 - 2차
      coatingLot2: formValues.coatingLot2,
      pressLot2: formValues.pressLot2,
      coatingQuantity2: formValues.coatingQuantity2 ? Number(formValues.coatingQuantity2) : undefined,
      pressQuantity2: formValues.pressQuantity2 ? Number(formValues.pressQuantity2) : undefined,
      weightPerAreaFront2M: formValues.weightPerAreaFront2M ? Number(formValues.weightPerAreaFront2M) : undefined,
      weightPerAreaFront2C: formValues.weightPerAreaFront2C ? Number(formValues.weightPerAreaFront2C) : undefined,
      weightPerAreaFront2D: formValues.weightPerAreaFront2D ? Number(formValues.weightPerAreaFront2D) : undefined,
      weightPerAreaRear2M: formValues.weightPerAreaRear2M ? Number(formValues.weightPerAreaRear2M) : undefined,
      weightPerAreaRear2C: formValues.weightPerAreaRear2C ? Number(formValues.weightPerAreaRear2C) : undefined,
      weightPerAreaRear2D: formValues.weightPerAreaRear2D ? Number(formValues.weightPerAreaRear2D) : undefined,
      thicknessFront2M: formValues.thicknessFront2M ? Number(formValues.thicknessFront2M) : undefined,
      thicknessFront2C: formValues.thicknessFront2C ? Number(formValues.thicknessFront2C) : undefined,
      thicknessFront2D: formValues.thicknessFront2D ? Number(formValues.thicknessFront2D) : undefined,
      thicknessRear2M: formValues.thicknessRear2M ? Number(formValues.thicknessRear2M) : undefined,
      thicknessRear2C: formValues.thicknessRear2C ? Number(formValues.thicknessRear2C) : undefined,
      thicknessRear2D: formValues.thicknessRear2D ? Number(formValues.thicknessRear2D) : undefined,

      // B. 생산 정보 - 3차
      coatingLot3: formValues.coatingLot3,
      pressLot3: formValues.pressLot3,
      coatingQuantity3: formValues.coatingQuantity3 ? Number(formValues.coatingQuantity3) : undefined,
      pressQuantity3: formValues.pressQuantity3 ? Number(formValues.pressQuantity3) : undefined,
      weightPerAreaFront3M: formValues.weightPerAreaFront3M ? Number(formValues.weightPerAreaFront3M) : undefined,
      weightPerAreaFront3C: formValues.weightPerAreaFront3C ? Number(formValues.weightPerAreaFront3C) : undefined,
      weightPerAreaFront3D: formValues.weightPerAreaFront3D ? Number(formValues.weightPerAreaFront3D) : undefined,
      weightPerAreaRear3M: formValues.weightPerAreaRear3M ? Number(formValues.weightPerAreaRear3M) : undefined,
      weightPerAreaRear3C: formValues.weightPerAreaRear3C ? Number(formValues.weightPerAreaRear3C) : undefined,
      weightPerAreaRear3D: formValues.weightPerAreaRear3D ? Number(formValues.weightPerAreaRear3D) : undefined,
      thicknessFront3M: formValues.thicknessFront3M ? Number(formValues.thicknessFront3M) : undefined,
      thicknessFront3C: formValues.thicknessFront3C ? Number(formValues.thicknessFront3C) : undefined,
      thicknessFront3D: formValues.thicknessFront3D ? Number(formValues.thicknessFront3D) : undefined,
      thicknessRear3M: formValues.thicknessRear3M ? Number(formValues.thicknessRear3M) : undefined,
      thicknessRear3C: formValues.thicknessRear3C ? Number(formValues.thicknessRear3C) : undefined,
      thicknessRear3D: formValues.thicknessRear3D ? Number(formValues.thicknessRear3D) : undefined,

      // B. 생산 정보 - 4차
      coatingLot4: formValues.coatingLot4,
      pressLot4: formValues.pressLot4,
      coatingQuantity4: formValues.coatingQuantity4 ? Number(formValues.coatingQuantity4) : undefined,
      pressQuantity4: formValues.pressQuantity4 ? Number(formValues.pressQuantity4) : undefined,
      weightPerAreaFront4M: formValues.weightPerAreaFront4M ? Number(formValues.weightPerAreaFront4M) : undefined,
      weightPerAreaFront4C: formValues.weightPerAreaFront4C ? Number(formValues.weightPerAreaFront4C) : undefined,
      weightPerAreaFront4D: formValues.weightPerAreaFront4D ? Number(formValues.weightPerAreaFront4D) : undefined,
      weightPerAreaRear4M: formValues.weightPerAreaRear4M ? Number(formValues.weightPerAreaRear4M) : undefined,
      weightPerAreaRear4C: formValues.weightPerAreaRear4C ? Number(formValues.weightPerAreaRear4C) : undefined,
      weightPerAreaRear4D: formValues.weightPerAreaRear4D ? Number(formValues.weightPerAreaRear4D) : undefined,
      thicknessFront4M: formValues.thicknessFront4M ? Number(formValues.thicknessFront4M) : undefined,
      thicknessFront4C: formValues.thicknessFront4C ? Number(formValues.thicknessFront4C) : undefined,
      thicknessFront4D: formValues.thicknessFront4D ? Number(formValues.thicknessFront4D) : undefined,
      thicknessRear4M: formValues.thicknessRear4M ? Number(formValues.thicknessRear4M) : undefined,
      thicknessRear4C: formValues.thicknessRear4C ? Number(formValues.thicknessRear4C) : undefined,
      thicknessRear4D: formValues.thicknessRear4D ? Number(formValues.thicknessRear4D) : undefined,

      // B. 생산 정보 - 5차
      coatingLot5: formValues.coatingLot5,
      pressLot5: formValues.pressLot5,
      coatingQuantity5: formValues.coatingQuantity5 ? Number(formValues.coatingQuantity5) : undefined,
      pressQuantity5: formValues.pressQuantity5 ? Number(formValues.pressQuantity5) : undefined,
      weightPerAreaFront5M: formValues.weightPerAreaFront5M ? Number(formValues.weightPerAreaFront5M) : undefined,
      weightPerAreaFront5C: formValues.weightPerAreaFront5C ? Number(formValues.weightPerAreaFront5C) : undefined,
      weightPerAreaFront5D: formValues.weightPerAreaFront5D ? Number(formValues.weightPerAreaFront5D) : undefined,
      weightPerAreaRear5M: formValues.weightPerAreaRear5M ? Number(formValues.weightPerAreaRear5M) : undefined,
      weightPerAreaRear5C: formValues.weightPerAreaRear5C ? Number(formValues.weightPerAreaRear5C) : undefined,
      weightPerAreaRear5D: formValues.weightPerAreaRear5D ? Number(formValues.weightPerAreaRear5D) : undefined,
      thicknessFront5M: formValues.thicknessFront5M ? Number(formValues.thicknessFront5M) : undefined,
      thicknessFront5C: formValues.thicknessFront5C ? Number(formValues.thicknessFront5C) : undefined,
      thicknessFront5D: formValues.thicknessFront5D ? Number(formValues.thicknessFront5D) : undefined,
      thicknessRear5M: formValues.thicknessRear5M ? Number(formValues.thicknessRear5M) : undefined,
      thicknessRear5C: formValues.thicknessRear5C ? Number(formValues.thicknessRear5C) : undefined,
      thicknessRear5D: formValues.thicknessRear5D ? Number(formValues.thicknessRear5D) : undefined,

      // C. 공정 조건
      tensionUnT: formValues.tensionUnT ? Number(formValues.tensionUnT) : undefined,
      tensionReT: formValues.tensionReT ? Number(formValues.tensionReT) : undefined,
      pressSpeed: formValues.pressSpeed ? Number(formValues.pressSpeed) : undefined,
      pressureCondition: formValues.pressureCondition ? Number(formValues.pressureCondition) : undefined,
      rollGapLeft: formValues.rollGapLeft ? Number(formValues.rollGapLeft) : undefined,
      rollGapRight: formValues.rollGapRight ? Number(formValues.rollGapRight) : undefined,
      rollTemperatureMain: formValues.rollTemperatureMain ? Number(formValues.rollTemperatureMain) : undefined,
      rollTemperatureInfeed: formValues.rollTemperatureInfeed ? Number(formValues.rollTemperatureInfeed) : undefined,
    };

    setSubmitting(true);
    try {
      await updatePressWorklog(Number(projectId), Number(worklogId), payload);
      alert('Press 작업일지가 수정되었습니다.');
      navigate(`/prod/log/${projectId}?category=Electrode&process=Press`);
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
        <div>
          <h2>Press 작업일지 수정</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
        </div>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={() => navigate(`/prod/log/${projectId}?category=Electrode&process=Press`)}>
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
        numericFields={PRESS_NUMERIC_FIELDS}
      />
    </div>
  );
}
