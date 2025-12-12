import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getVdWorklog, updateVdWorklog } from './VdService';
import type { VdWorklog, VdWorklogPayload } from './VdTypes';
import styles from '../../../../../styles/production/worklog/common.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';

export default function VdEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Vd');
  const [worklog, setWorklog] = useState<VdWorklog | null>(null);
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
        const data = await getVdWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        // 데이터를 formValues로 변환
        const values: Record<string, any> = {
          workDate: data.workDate,
          round: data.round,

          // A. 자재 투입 정보
          cathodeMagazineLot1: data.cathodeMagazineLot1 ?? '',
          cathodeMagazineLot2: data.cathodeMagazineLot2 ?? '',
          cathodeMagazineLot3: data.cathodeMagazineLot3 ?? '',
          cathodeMagazineLot4: data.cathodeMagazineLot4 ?? '',
          cathodeMagazineLot5: data.cathodeMagazineLot5 ?? '',
          anodeMagazineLot1: data.anodeMagazineLot1 ?? '',
          anodeMagazineLot2: data.anodeMagazineLot2 ?? '',
          anodeMagazineLot3: data.anodeMagazineLot3 ?? '',
          anodeMagazineLot4: data.anodeMagazineLot4 ?? '',
          anodeMagazineLot5: data.anodeMagazineLot5 ?? '',

          // B. 생산 정보 - 1차
          cathodeLot1: data.cathodeLot1 ?? '',
          cathodeInputQuantity1: data.cathodeInputQuantity1 ?? '',
          cathodeInputOutputTime1: data.cathodeInputOutputTime1 ?? '',
          cathodeMoistureMeasurement1: data.cathodeMoistureMeasurement1 ?? '',
          anodeLot1: data.anodeLot1 ?? '',
          anodeInputQuantity1: data.anodeInputQuantity1 ?? '',
          anodeInputOutputTime1: data.anodeInputOutputTime1 ?? '',
          anodeMoistureMeasurement1: data.anodeMoistureMeasurement1 ?? '',

          // B. 생산 정보 - 2차
          cathodeLot2: data.cathodeLot2 ?? '',
          cathodeInputQuantity2: data.cathodeInputQuantity2 ?? '',
          cathodeInputOutputTime2: data.cathodeInputOutputTime2 ?? '',
          cathodeMoistureMeasurement2: data.cathodeMoistureMeasurement2 ?? '',
          anodeLot2: data.anodeLot2 ?? '',
          anodeInputQuantity2: data.anodeInputQuantity2 ?? '',
          anodeInputOutputTime2: data.anodeInputOutputTime2 ?? '',
          anodeMoistureMeasurement2: data.anodeMoistureMeasurement2 ?? '',

          // B. 생산 정보 - 3차
          cathodeLot3: data.cathodeLot3 ?? '',
          cathodeInputQuantity3: data.cathodeInputQuantity3 ?? '',
          cathodeInputOutputTime3: data.cathodeInputOutputTime3 ?? '',
          cathodeMoistureMeasurement3: data.cathodeMoistureMeasurement3 ?? '',
          anodeLot3: data.anodeLot3 ?? '',
          anodeInputQuantity3: data.anodeInputQuantity3 ?? '',
          anodeInputOutputTime3: data.anodeInputOutputTime3 ?? '',
          anodeMoistureMeasurement3: data.anodeMoistureMeasurement3 ?? '',

          // B. 생산 정보 - 4차
          cathodeLot4: data.cathodeLot4 ?? '',
          cathodeInputQuantity4: data.cathodeInputQuantity4 ?? '',
          cathodeInputOutputTime4: data.cathodeInputOutputTime4 ?? '',
          cathodeMoistureMeasurement4: data.cathodeMoistureMeasurement4 ?? '',
          anodeLot4: data.anodeLot4 ?? '',
          anodeInputQuantity4: data.anodeInputQuantity4 ?? '',
          anodeInputOutputTime4: data.anodeInputOutputTime4 ?? '',
          anodeMoistureMeasurement4: data.anodeMoistureMeasurement4 ?? '',

          // B. 생산 정보 - 5차
          cathodeLot5: data.cathodeLot5 ?? '',
          cathodeInputQuantity5: data.cathodeInputQuantity5 ?? '',
          cathodeInputOutputTime5: data.cathodeInputOutputTime5 ?? '',
          cathodeMoistureMeasurement5: data.cathodeMoistureMeasurement5 ?? '',
          anodeLot5: data.anodeLot5 ?? '',
          anodeInputQuantity5: data.anodeInputQuantity5 ?? '',
          anodeInputOutputTime5: data.anodeInputOutputTime5 ?? '',
          anodeMoistureMeasurement5: data.anodeMoistureMeasurement5 ?? '',

          // C. 공정 조건
          vacuumDegreeSetting: data.vacuumDegreeSetting ?? '',
          cathodeSetTemperature: data.cathodeSetTemperature ?? '',
          anodeSetTemperature: data.anodeSetTemperature ?? '',
          cathodeTimerTime: data.cathodeTimerTime ?? '',
          anodeTimerTime: data.anodeTimerTime ?? '',
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

    const payload: VdWorklogPayload = {
      workDate: formValues.workDate || '',
      round: Number(formValues.round) || 0,

      // A. 자재 투입 정보
      cathodeMagazineLot1: formValues.cathodeMagazineLot1,
      cathodeMagazineLot2: formValues.cathodeMagazineLot2,
      cathodeMagazineLot3: formValues.cathodeMagazineLot3,
      cathodeMagazineLot4: formValues.cathodeMagazineLot4,
      cathodeMagazineLot5: formValues.cathodeMagazineLot5,
      anodeMagazineLot1: formValues.anodeMagazineLot1,
      anodeMagazineLot2: formValues.anodeMagazineLot2,
      anodeMagazineLot3: formValues.anodeMagazineLot3,
      anodeMagazineLot4: formValues.anodeMagazineLot4,
      anodeMagazineLot5: formValues.anodeMagazineLot5,

      // B. 생산 정보 - 1차
      cathodeLot1: formValues.cathodeLot1,
      cathodeInputQuantity1: formValues.cathodeInputQuantity1 ? Number(formValues.cathodeInputQuantity1) : undefined,
      cathodeInputOutputTime1: formValues.cathodeInputOutputTime1,
      cathodeMoistureMeasurement1: formValues.cathodeMoistureMeasurement1 ? Number(formValues.cathodeMoistureMeasurement1) : undefined,
      anodeLot1: formValues.anodeLot1,
      anodeInputQuantity1: formValues.anodeInputQuantity1 ? Number(formValues.anodeInputQuantity1) : undefined,
      anodeInputOutputTime1: formValues.anodeInputOutputTime1,
      anodeMoistureMeasurement1: formValues.anodeMoistureMeasurement1 ? Number(formValues.anodeMoistureMeasurement1) : undefined,

      // B. 생산 정보 - 2차
      cathodeLot2: formValues.cathodeLot2,
      cathodeInputQuantity2: formValues.cathodeInputQuantity2 ? Number(formValues.cathodeInputQuantity2) : undefined,
      cathodeInputOutputTime2: formValues.cathodeInputOutputTime2,
      cathodeMoistureMeasurement2: formValues.cathodeMoistureMeasurement2 ? Number(formValues.cathodeMoistureMeasurement2) : undefined,
      anodeLot2: formValues.anodeLot2,
      anodeInputQuantity2: formValues.anodeInputQuantity2 ? Number(formValues.anodeInputQuantity2) : undefined,
      anodeInputOutputTime2: formValues.anodeInputOutputTime2,
      anodeMoistureMeasurement2: formValues.anodeMoistureMeasurement2 ? Number(formValues.anodeMoistureMeasurement2) : undefined,

      // B. 생산 정보 - 3차
      cathodeLot3: formValues.cathodeLot3,
      cathodeInputQuantity3: formValues.cathodeInputQuantity3 ? Number(formValues.cathodeInputQuantity3) : undefined,
      cathodeInputOutputTime3: formValues.cathodeInputOutputTime3,
      cathodeMoistureMeasurement3: formValues.cathodeMoistureMeasurement3 ? Number(formValues.cathodeMoistureMeasurement3) : undefined,
      anodeLot3: formValues.anodeLot3,
      anodeInputQuantity3: formValues.anodeInputQuantity3 ? Number(formValues.anodeInputQuantity3) : undefined,
      anodeInputOutputTime3: formValues.anodeInputOutputTime3,
      anodeMoistureMeasurement3: formValues.anodeMoistureMeasurement3 ? Number(formValues.anodeMoistureMeasurement3) : undefined,

      // B. 생산 정보 - 4차
      cathodeLot4: formValues.cathodeLot4,
      cathodeInputQuantity4: formValues.cathodeInputQuantity4 ? Number(formValues.cathodeInputQuantity4) : undefined,
      cathodeInputOutputTime4: formValues.cathodeInputOutputTime4,
      cathodeMoistureMeasurement4: formValues.cathodeMoistureMeasurement4 ? Number(formValues.cathodeMoistureMeasurement4) : undefined,
      anodeLot4: formValues.anodeLot4,
      anodeInputQuantity4: formValues.anodeInputQuantity4 ? Number(formValues.anodeInputQuantity4) : undefined,
      anodeInputOutputTime4: formValues.anodeInputOutputTime4,
      anodeMoistureMeasurement4: formValues.anodeMoistureMeasurement4 ? Number(formValues.anodeMoistureMeasurement4) : undefined,

      // B. 생산 정보 - 5차
      cathodeLot5: formValues.cathodeLot5,
      cathodeInputQuantity5: formValues.cathodeInputQuantity5 ? Number(formValues.cathodeInputQuantity5) : undefined,
      cathodeInputOutputTime5: formValues.cathodeInputOutputTime5,
      cathodeMoistureMeasurement5: formValues.cathodeMoistureMeasurement5 ? Number(formValues.cathodeMoistureMeasurement5) : undefined,
      anodeLot5: formValues.anodeLot5,
      anodeInputQuantity5: formValues.anodeInputQuantity5 ? Number(formValues.anodeInputQuantity5) : undefined,
      anodeInputOutputTime5: formValues.anodeInputOutputTime5,
      anodeMoistureMeasurement5: formValues.anodeMoistureMeasurement5 ? Number(formValues.anodeMoistureMeasurement5) : undefined,

      // C. 공정 조건
      vacuumDegreeSetting: formValues.vacuumDegreeSetting ? Number(formValues.vacuumDegreeSetting) : undefined,
      cathodeSetTemperature: formValues.cathodeSetTemperature ? Number(formValues.cathodeSetTemperature) : undefined,
      anodeSetTemperature: formValues.anodeSetTemperature ? Number(formValues.anodeSetTemperature) : undefined,
      cathodeTimerTime: formValues.cathodeTimerTime ? Number(formValues.cathodeTimerTime) : undefined,
      anodeTimerTime: formValues.anodeTimerTime ? Number(formValues.anodeTimerTime) : undefined,
    };

    setSubmitting(true);
    try {
      await updateVdWorklog(Number(projectId), Number(worklogId), payload);
      alert('VD 작업일지가 수정되었습니다.');
      navigate(`/prod/log/${projectId}?category=Electrode&process=VD`);
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
          <h2>VD 작업일지 수정</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
        </div>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={() => navigate(`/prod/log/${projectId}?category=Electrode&process=VD`)}>
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
      />
    </div>
  );
}
