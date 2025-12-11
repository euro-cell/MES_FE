import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getNotchingWorklog, updateNotchingWorklog } from './NotchingService';
import type { NotchingWorklog, NotchingWorklogPayload } from './NotchingTypes';
import styles from '../../../../../../styles/production/worklog/NotchingEdit.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';

export default function NotchingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Notching');
  const [worklog, setWorklog] = useState<NotchingWorklog | null>(null);
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
        const data = await getNotchingWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        // 데이터를 formValues로 변환
        const values: Record<string, any> = {
          workDate: data.workDate,
          round: data.round,

          // A. 자재 투입 정보
          pressRollLot1: data.pressRollLot1 ?? '',
          pressRollLot2: data.pressRollLot2 ?? '',
          pressRollLot3: data.pressRollLot3 ?? '',
          pressRollLot4: data.pressRollLot4 ?? '',
          pressRollLot5: data.pressRollLot5 ?? '',

          // B. 생산 정보 - 1차
          pressLot1: data.pressLot1 ?? '',
          pressQuantity1: data.pressQuantity1 ?? '',
          notchingLot1: data.notchingLot1 ?? '',
          notchingQuantity1: data.notchingQuantity1 ?? '',
          defectQuantity1: data.defectQuantity1 ?? '',
          goodQuantity1: data.goodQuantity1 ?? '',
          dimension1: data.dimension1 ?? '',
          burr1: data.burr1 ?? '',
          damage1: data.damage1 ?? '',
          nonCutting1: data.nonCutting1 ?? '',
          overTab1: data.overTab1 ?? '',
          wide1: data.wide1 ?? '',
          length1: data.length1 ?? '',
          missMatch1: data.missMatch1 ?? '',

          // B. 생산 정보 - 2차
          pressLot2: data.pressLot2 ?? '',
          pressQuantity2: data.pressQuantity2 ?? '',
          notchingLot2: data.notchingLot2 ?? '',
          notchingQuantity2: data.notchingQuantity2 ?? '',
          defectQuantity2: data.defectQuantity2 ?? '',
          goodQuantity2: data.goodQuantity2 ?? '',
          dimension2: data.dimension2 ?? '',
          burr2: data.burr2 ?? '',
          damage2: data.damage2 ?? '',
          nonCutting2: data.nonCutting2 ?? '',
          overTab2: data.overTab2 ?? '',
          wide2: data.wide2 ?? '',
          length2: data.length2 ?? '',
          missMatch2: data.missMatch2 ?? '',

          // B. 생산 정보 - 3차
          pressLot3: data.pressLot3 ?? '',
          pressQuantity3: data.pressQuantity3 ?? '',
          notchingLot3: data.notchingLot3 ?? '',
          notchingQuantity3: data.notchingQuantity3 ?? '',
          defectQuantity3: data.defectQuantity3 ?? '',
          goodQuantity3: data.goodQuantity3 ?? '',
          dimension3: data.dimension3 ?? '',
          burr3: data.burr3 ?? '',
          damage3: data.damage3 ?? '',
          nonCutting3: data.nonCutting3 ?? '',
          overTab3: data.overTab3 ?? '',
          wide3: data.wide3 ?? '',
          length3: data.length3 ?? '',
          missMatch3: data.missMatch3 ?? '',

          // B. 생산 정보 - 4차
          pressLot4: data.pressLot4 ?? '',
          pressQuantity4: data.pressQuantity4 ?? '',
          notchingLot4: data.notchingLot4 ?? '',
          notchingQuantity4: data.notchingQuantity4 ?? '',
          defectQuantity4: data.defectQuantity4 ?? '',
          goodQuantity4: data.goodQuantity4 ?? '',
          dimension4: data.dimension4 ?? '',
          burr4: data.burr4 ?? '',
          damage4: data.damage4 ?? '',
          nonCutting4: data.nonCutting4 ?? '',
          overTab4: data.overTab4 ?? '',
          wide4: data.wide4 ?? '',
          length4: data.length4 ?? '',
          missMatch4: data.missMatch4 ?? '',

          // B. 생산 정보 - 5차
          pressLot5: data.pressLot5 ?? '',
          pressQuantity5: data.pressQuantity5 ?? '',
          notchingLot5: data.notchingLot5 ?? '',
          notchingQuantity5: data.notchingQuantity5 ?? '',
          defectQuantity5: data.defectQuantity5 ?? '',
          goodQuantity5: data.goodQuantity5 ?? '',
          dimension5: data.dimension5 ?? '',
          burr5: data.burr5 ?? '',
          damage5: data.damage5 ?? '',
          nonCutting5: data.nonCutting5 ?? '',
          overTab5: data.overTab5 ?? '',
          wide5: data.wide5 ?? '',
          length5: data.length5 ?? '',
          missMatch5: data.missMatch5 ?? '',

          // C. 공정 조건
          tension: data.tension ?? '',
          punchingSpeed: data.punchingSpeed ?? '',
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

    const payload: NotchingWorklogPayload = {
      workDate: formValues.workDate || '',
      round: Number(formValues.round) || 0,

      // A. 자재 투입 정보
      pressRollLot1: formValues.pressRollLot1,
      pressRollLot2: formValues.pressRollLot2,
      pressRollLot3: formValues.pressRollLot3,
      pressRollLot4: formValues.pressRollLot4,
      pressRollLot5: formValues.pressRollLot5,

      // B. 생산 정보 - 1차
      pressLot1: formValues.pressLot1,
      pressQuantity1: formValues.pressQuantity1 ? Number(formValues.pressQuantity1) : undefined,
      notchingLot1: formValues.notchingLot1,
      notchingQuantity1: formValues.notchingQuantity1 ? Number(formValues.notchingQuantity1) : undefined,
      defectQuantity1: formValues.defectQuantity1 ? Number(formValues.defectQuantity1) : undefined,
      goodQuantity1: formValues.goodQuantity1 ? Number(formValues.goodQuantity1) : undefined,
      dimension1: formValues.dimension1 ? Number(formValues.dimension1) : undefined,
      burr1: formValues.burr1 ? Number(formValues.burr1) : undefined,
      damage1: formValues.damage1 ? Number(formValues.damage1) : undefined,
      nonCutting1: formValues.nonCutting1 ? Number(formValues.nonCutting1) : undefined,
      overTab1: formValues.overTab1 ? Number(formValues.overTab1) : undefined,
      wide1: formValues.wide1 ? Number(formValues.wide1) : undefined,
      length1: formValues.length1 ? Number(formValues.length1) : undefined,
      missMatch1: formValues.missMatch1 ? Number(formValues.missMatch1) : undefined,

      // B. 생산 정보 - 2차
      pressLot2: formValues.pressLot2,
      pressQuantity2: formValues.pressQuantity2 ? Number(formValues.pressQuantity2) : undefined,
      notchingLot2: formValues.notchingLot2,
      notchingQuantity2: formValues.notchingQuantity2 ? Number(formValues.notchingQuantity2) : undefined,
      defectQuantity2: formValues.defectQuantity2 ? Number(formValues.defectQuantity2) : undefined,
      goodQuantity2: formValues.goodQuantity2 ? Number(formValues.goodQuantity2) : undefined,
      dimension2: formValues.dimension2 ? Number(formValues.dimension2) : undefined,
      burr2: formValues.burr2 ? Number(formValues.burr2) : undefined,
      damage2: formValues.damage2 ? Number(formValues.damage2) : undefined,
      nonCutting2: formValues.nonCutting2 ? Number(formValues.nonCutting2) : undefined,
      overTab2: formValues.overTab2 ? Number(formValues.overTab2) : undefined,
      wide2: formValues.wide2 ? Number(formValues.wide2) : undefined,
      length2: formValues.length2 ? Number(formValues.length2) : undefined,
      missMatch2: formValues.missMatch2 ? Number(formValues.missMatch2) : undefined,

      // B. 생산 정보 - 3차
      pressLot3: formValues.pressLot3,
      pressQuantity3: formValues.pressQuantity3 ? Number(formValues.pressQuantity3) : undefined,
      notchingLot3: formValues.notchingLot3,
      notchingQuantity3: formValues.notchingQuantity3 ? Number(formValues.notchingQuantity3) : undefined,
      defectQuantity3: formValues.defectQuantity3 ? Number(formValues.defectQuantity3) : undefined,
      goodQuantity3: formValues.goodQuantity3 ? Number(formValues.goodQuantity3) : undefined,
      dimension3: formValues.dimension3 ? Number(formValues.dimension3) : undefined,
      burr3: formValues.burr3 ? Number(formValues.burr3) : undefined,
      damage3: formValues.damage3 ? Number(formValues.damage3) : undefined,
      nonCutting3: formValues.nonCutting3 ? Number(formValues.nonCutting3) : undefined,
      overTab3: formValues.overTab3 ? Number(formValues.overTab3) : undefined,
      wide3: formValues.wide3 ? Number(formValues.wide3) : undefined,
      length3: formValues.length3 ? Number(formValues.length3) : undefined,
      missMatch3: formValues.missMatch3 ? Number(formValues.missMatch3) : undefined,

      // B. 생산 정보 - 4차
      pressLot4: formValues.pressLot4,
      pressQuantity4: formValues.pressQuantity4 ? Number(formValues.pressQuantity4) : undefined,
      notchingLot4: formValues.notchingLot4,
      notchingQuantity4: formValues.notchingQuantity4 ? Number(formValues.notchingQuantity4) : undefined,
      defectQuantity4: formValues.defectQuantity4 ? Number(formValues.defectQuantity4) : undefined,
      goodQuantity4: formValues.goodQuantity4 ? Number(formValues.goodQuantity4) : undefined,
      dimension4: formValues.dimension4 ? Number(formValues.dimension4) : undefined,
      burr4: formValues.burr4 ? Number(formValues.burr4) : undefined,
      damage4: formValues.damage4 ? Number(formValues.damage4) : undefined,
      nonCutting4: formValues.nonCutting4 ? Number(formValues.nonCutting4) : undefined,
      overTab4: formValues.overTab4 ? Number(formValues.overTab4) : undefined,
      wide4: formValues.wide4 ? Number(formValues.wide4) : undefined,
      length4: formValues.length4 ? Number(formValues.length4) : undefined,
      missMatch4: formValues.missMatch4 ? Number(formValues.missMatch4) : undefined,

      // B. 생산 정보 - 5차
      pressLot5: formValues.pressLot5,
      pressQuantity5: formValues.pressQuantity5 ? Number(formValues.pressQuantity5) : undefined,
      notchingLot5: formValues.notchingLot5,
      notchingQuantity5: formValues.notchingQuantity5 ? Number(formValues.notchingQuantity5) : undefined,
      defectQuantity5: formValues.defectQuantity5 ? Number(formValues.defectQuantity5) : undefined,
      goodQuantity5: formValues.goodQuantity5 ? Number(formValues.goodQuantity5) : undefined,
      dimension5: formValues.dimension5 ? Number(formValues.dimension5) : undefined,
      burr5: formValues.burr5 ? Number(formValues.burr5) : undefined,
      damage5: formValues.damage5 ? Number(formValues.damage5) : undefined,
      nonCutting5: formValues.nonCutting5 ? Number(formValues.nonCutting5) : undefined,
      overTab5: formValues.overTab5 ? Number(formValues.overTab5) : undefined,
      wide5: formValues.wide5 ? Number(formValues.wide5) : undefined,
      length5: formValues.length5 ? Number(formValues.length5) : undefined,
      missMatch5: formValues.missMatch5 ? Number(formValues.missMatch5) : undefined,

      // C. 공정 조건
      tension: formValues.tension ? Number(formValues.tension) : undefined,
      punchingSpeed: formValues.punchingSpeed ? Number(formValues.punchingSpeed) : undefined,
    };

    setSubmitting(true);
    try {
      await updateNotchingWorklog(Number(projectId), Number(worklogId), payload);
      alert('Notching 작업일지가 수정되었습니다.');
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
        <h2>Notching 작업일지 수정</h2>
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
