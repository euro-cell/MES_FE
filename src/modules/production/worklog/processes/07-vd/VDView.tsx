import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getVdWorklog } from './VdService';
import type { VdWorklog } from './VdTypes';
import styles from '../../../../../styles/production/worklog/common.module.css';

export default function VdView() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Vd');
  const [worklog, setWorklog] = useState<VdWorklog | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, any>>({});
  const [namedRanges, setNamedRanges] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

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

        // 데이터를 cellValues로 변환
        const values: Record<string, any> = {
          workDate: data.workDate,
          round: data.round,

          // A. 자재 투입 정보
          cathodeMagazineLot1: data.cathodeMagazineLot1,
          cathodeMagazineLot2: data.cathodeMagazineLot2,
          cathodeMagazineLot3: data.cathodeMagazineLot3,
          cathodeMagazineLot4: data.cathodeMagazineLot4,
          cathodeMagazineLot5: data.cathodeMagazineLot5,
          anodeMagazineLot1: data.anodeMagazineLot1,
          anodeMagazineLot2: data.anodeMagazineLot2,
          anodeMagazineLot3: data.anodeMagazineLot3,
          anodeMagazineLot4: data.anodeMagazineLot4,
          anodeMagazineLot5: data.anodeMagazineLot5,

          // B. 생산 정보 - 1차
          cathodeLot1: data.cathodeLot1,
          cathodeInputQuantity1: data.cathodeInputQuantity1,
          cathodeInputOutputTime1: data.cathodeInputOutputTime1,
          cathodeMoistureMeasurement1: data.cathodeMoistureMeasurement1,
          anodeLot1: data.anodeLot1,
          anodeInputQuantity1: data.anodeInputQuantity1,
          anodeInputOutputTime1: data.anodeInputOutputTime1,
          anodeMoistureMeasurement1: data.anodeMoistureMeasurement1,

          // B. 생산 정보 - 2차
          cathodeLot2: data.cathodeLot2,
          cathodeInputQuantity2: data.cathodeInputQuantity2,
          cathodeInputOutputTime2: data.cathodeInputOutputTime2,
          cathodeMoistureMeasurement2: data.cathodeMoistureMeasurement2,
          anodeLot2: data.anodeLot2,
          anodeInputQuantity2: data.anodeInputQuantity2,
          anodeInputOutputTime2: data.anodeInputOutputTime2,
          anodeMoistureMeasurement2: data.anodeMoistureMeasurement2,

          // B. 생산 정보 - 3차
          cathodeLot3: data.cathodeLot3,
          cathodeInputQuantity3: data.cathodeInputQuantity3,
          cathodeInputOutputTime3: data.cathodeInputOutputTime3,
          cathodeMoistureMeasurement3: data.cathodeMoistureMeasurement3,
          anodeLot3: data.anodeLot3,
          anodeInputQuantity3: data.anodeInputQuantity3,
          anodeInputOutputTime3: data.anodeInputOutputTime3,
          anodeMoistureMeasurement3: data.anodeMoistureMeasurement3,

          // B. 생산 정보 - 4차
          cathodeLot4: data.cathodeLot4,
          cathodeInputQuantity4: data.cathodeInputQuantity4,
          cathodeInputOutputTime4: data.cathodeInputOutputTime4,
          cathodeMoistureMeasurement4: data.cathodeMoistureMeasurement4,
          anodeLot4: data.anodeLot4,
          anodeInputQuantity4: data.anodeInputQuantity4,
          anodeInputOutputTime4: data.anodeInputOutputTime4,
          anodeMoistureMeasurement4: data.anodeMoistureMeasurement4,

          // B. 생산 정보 - 5차
          cathodeLot5: data.cathodeLot5,
          cathodeInputQuantity5: data.cathodeInputQuantity5,
          cathodeInputOutputTime5: data.cathodeInputOutputTime5,
          cathodeMoistureMeasurement5: data.cathodeMoistureMeasurement5,
          anodeLot5: data.anodeLot5,
          anodeInputQuantity5: data.anodeInputQuantity5,
          anodeInputOutputTime5: data.anodeInputOutputTime5,
          anodeMoistureMeasurement5: data.anodeMoistureMeasurement5,

          // C. 공정 조건
          vacuumDegreeSetting: data.vacuumDegreeSetting,
          cathodeSetTemperature: data.cathodeSetTemperature,
          anodeSetTemperature: data.anodeSetTemperature,
          cathodeTimerTime: data.cathodeTimerTime,
          anodeTimerTime: data.anodeTimerTime,
        };

        setCellValues(values);
      } catch (err) {
        console.error('작업일지 조회 실패:', err);
        alert('작업일지를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId]);

  const handleBack = () => {
    navigate(`/prod/log/${projectId}?category=Assembly&process=VD`);
  };

  const handleEdit = () => {
    navigate(`/prod/log/${projectId}/vd/edit/${worklogId}`);
  };

  if (templateLoading || loading) return <p>데이터를 불러오는 중...</p>;
  if (templateError) return <p>템플릿 로드 실패: {templateError.message}</p>;
  if (!workbook || !worklog) return <p>데이터를 불러올 수 없습니다.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>VD 작업일지 조회</h2>
        <div className={styles.actions}>
          <button onClick={handleBack} className={styles.backButton}>
            목록
          </button>
          <button onClick={handleEdit} className={styles.editButton}>
            수정
          </button>
        </div>
      </div>

      <div className={styles.excelWrapper}>
        <ExcelRenderer
          workbook={workbook}
          editableRanges={[]}
          cellValues={cellValues}
          namedRanges={namedRanges}
        />
      </div>
    </div>
  );
}
