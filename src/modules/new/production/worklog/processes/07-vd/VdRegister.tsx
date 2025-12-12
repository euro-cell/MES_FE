import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { createVdWorklog } from './VdService';
import type { VdWorklogPayload } from './VdTypes';
import styles from '../../../../../../styles/production/worklog/VdRegister.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';

export default function VdRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading, error } = useExcelTemplate('Vd');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [namedRanges, setNamedRanges] = useState<Record<string, any>>({});
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

  // 초기 폼 값 설정
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

    const payload: VdWorklogPayload = {
      workDate: formValues.workDate || '',
      round: Number(formValues.round) || 0,

      // A. 자재 투입 정보 - 양극 매거진
      cathodeMagazineLot1: formValues.cathodeMagazineLot1,
      cathodeMagazineLot2: formValues.cathodeMagazineLot2,
      cathodeMagazineLot3: formValues.cathodeMagazineLot3,
      cathodeMagazineLot4: formValues.cathodeMagazineLot4,
      cathodeMagazineLot5: formValues.cathodeMagazineLot5,

      // A. 자재 투입 정보 - 음극 매거진
      anodeMagazineLot1: formValues.anodeMagazineLot1,
      anodeMagazineLot2: formValues.anodeMagazineLot2,
      anodeMagazineLot3: formValues.anodeMagazineLot3,
      anodeMagazineLot4: formValues.anodeMagazineLot4,
      anodeMagazineLot5: formValues.anodeMagazineLot5,

      // B. 생산 정보 - 1차 양극
      cathodeLot1: formValues.cathodeLot1,
      cathodeInputQuantity1: formValues.cathodeInputQuantity1 ? Number(formValues.cathodeInputQuantity1) : undefined,
      cathodeInputOutputTime1: formValues.cathodeInputOutputTime1,
      cathodeMoistureMeasurement1: formValues.cathodeMoistureMeasurement1 ? Number(formValues.cathodeMoistureMeasurement1) : undefined,

      // B. 생산 정보 - 1차 음극
      anodeLot1: formValues.anodeLot1,
      anodeInputQuantity1: formValues.anodeInputQuantity1 ? Number(formValues.anodeInputQuantity1) : undefined,
      anodeInputOutputTime1: formValues.anodeInputOutputTime1,
      anodeMoistureMeasurement1: formValues.anodeMoistureMeasurement1 ? Number(formValues.anodeMoistureMeasurement1) : undefined,

      // B. 생산 정보 - 2차 양극
      cathodeLot2: formValues.cathodeLot2,
      cathodeInputQuantity2: formValues.cathodeInputQuantity2 ? Number(formValues.cathodeInputQuantity2) : undefined,
      cathodeInputOutputTime2: formValues.cathodeInputOutputTime2,
      cathodeMoistureMeasurement2: formValues.cathodeMoistureMeasurement2 ? Number(formValues.cathodeMoistureMeasurement2) : undefined,

      // B. 생산 정보 - 2차 음극
      anodeLot2: formValues.anodeLot2,
      anodeInputQuantity2: formValues.anodeInputQuantity2 ? Number(formValues.anodeInputQuantity2) : undefined,
      anodeInputOutputTime2: formValues.anodeInputOutputTime2,
      anodeMoistureMeasurement2: formValues.anodeMoistureMeasurement2 ? Number(formValues.anodeMoistureMeasurement2) : undefined,

      // B. 생산 정보 - 3차 양극
      cathodeLot3: formValues.cathodeLot3,
      cathodeInputQuantity3: formValues.cathodeInputQuantity3 ? Number(formValues.cathodeInputQuantity3) : undefined,
      cathodeInputOutputTime3: formValues.cathodeInputOutputTime3,
      cathodeMoistureMeasurement3: formValues.cathodeMoistureMeasurement3 ? Number(formValues.cathodeMoistureMeasurement3) : undefined,

      // B. 생산 정보 - 3차 음극
      anodeLot3: formValues.anodeLot3,
      anodeInputQuantity3: formValues.anodeInputQuantity3 ? Number(formValues.anodeInputQuantity3) : undefined,
      anodeInputOutputTime3: formValues.anodeInputOutputTime3,
      anodeMoistureMeasurement3: formValues.anodeMoistureMeasurement3 ? Number(formValues.anodeMoistureMeasurement3) : undefined,

      // B. 생산 정보 - 4차 양극
      cathodeLot4: formValues.cathodeLot4,
      cathodeInputQuantity4: formValues.cathodeInputQuantity4 ? Number(formValues.cathodeInputQuantity4) : undefined,
      cathodeInputOutputTime4: formValues.cathodeInputOutputTime4,
      cathodeMoistureMeasurement4: formValues.cathodeMoistureMeasurement4 ? Number(formValues.cathodeMoistureMeasurement4) : undefined,

      // B. 생산 정보 - 4차 음극
      anodeLot4: formValues.anodeLot4,
      anodeInputQuantity4: formValues.anodeInputQuantity4 ? Number(formValues.anodeInputQuantity4) : undefined,
      anodeInputOutputTime4: formValues.anodeInputOutputTime4,
      anodeMoistureMeasurement4: formValues.anodeMoistureMeasurement4 ? Number(formValues.anodeMoistureMeasurement4) : undefined,

      // B. 생산 정보 - 5차 양극
      cathodeLot5: formValues.cathodeLot5,
      cathodeInputQuantity5: formValues.cathodeInputQuantity5 ? Number(formValues.cathodeInputQuantity5) : undefined,
      cathodeInputOutputTime5: formValues.cathodeInputOutputTime5,
      cathodeMoistureMeasurement5: formValues.cathodeMoistureMeasurement5 ? Number(formValues.cathodeMoistureMeasurement5) : undefined,

      // B. 생산 정보 - 5차 음극
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
      await createVdWorklog(Number(projectId), payload);
      alert('VD 작업일지가 등록되었습니다.');
      navigate(`/prod/log/${projectId}?category=Electrode&process=VD`);
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
        <div>
          <h2>VD 작업일지 등록</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
        </div>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={() => navigate(`/prod/log/${projectId}?category=Electrode&process=VD`)}>
            취소
          </button>
          <button className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
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
      />
    </div>
  );
}
