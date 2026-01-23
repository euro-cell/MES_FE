import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getVdWorklog } from './VdService';
import type { VdWorklog } from './VdTypes';
import styles from '../../../../../styles/project/worklog/common.module.css';

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
          manufactureDate: data.manufactureDate,
          worker: data.worker,
          line: data.line,
          plant: data.plant,
          shift: data.shift,

          // A. 자재 투입 정보 (변경 없음)
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
          upperLot1: data.upperLot1,
          upperInputQuantity1: data.upperInputQuantity1,
          upperInputOutputTime1: data.upperInputOutputTime1,
          upperMoistureMeasurement1: data.upperMoistureMeasurement1,
          lowerLot1: data.lowerLot1,
          lowerInputQuantity1: data.lowerInputQuantity1,
          lowerInputOutputTime1: data.lowerInputOutputTime1,
          lowerMoistureMeasurement1: data.lowerMoistureMeasurement1,

          // B. 생산 정보 - 2차
          upperLot2: data.upperLot2,
          upperInputQuantity2: data.upperInputQuantity2,
          upperInputOutputTime2: data.upperInputOutputTime2,
          upperMoistureMeasurement2: data.upperMoistureMeasurement2,
          lowerLot2: data.lowerLot2,
          lowerInputQuantity2: data.lowerInputQuantity2,
          lowerInputOutputTime2: data.lowerInputOutputTime2,
          lowerMoistureMeasurement2: data.lowerMoistureMeasurement2,

          // B. 생산 정보 - 3차
          upperLot3: data.upperLot3,
          upperInputQuantity3: data.upperInputQuantity3,
          upperInputOutputTime3: data.upperInputOutputTime3,
          upperMoistureMeasurement3: data.upperMoistureMeasurement3,
          lowerLot3: data.lowerLot3,
          lowerInputQuantity3: data.lowerInputQuantity3,
          lowerInputOutputTime3: data.lowerInputOutputTime3,
          lowerMoistureMeasurement3: data.lowerMoistureMeasurement3,

          // B. 생산 정보 - 4차
          upperLot4: data.upperLot4,
          upperInputQuantity4: data.upperInputQuantity4,
          upperInputOutputTime4: data.upperInputOutputTime4,
          upperMoistureMeasurement4: data.upperMoistureMeasurement4,
          lowerLot4: data.lowerLot4,
          lowerInputQuantity4: data.lowerInputQuantity4,
          lowerInputOutputTime4: data.lowerInputOutputTime4,
          lowerMoistureMeasurement4: data.lowerMoistureMeasurement4,

          // B. 생산 정보 - 5차
          upperLot5: data.upperLot5,
          upperInputQuantity5: data.upperInputQuantity5,
          upperInputOutputTime5: data.upperInputOutputTime5,
          upperMoistureMeasurement5: data.upperMoistureMeasurement5,
          lowerLot5: data.lowerLot5,
          lowerInputQuantity5: data.lowerInputQuantity5,
          lowerInputOutputTime5: data.lowerInputOutputTime5,
          lowerMoistureMeasurement5: data.lowerMoistureMeasurement5,

          // C. 공정 조건
          vacuumDegreeSetting: data.vacuumDegreeSetting,
          upperSetTemperature: data.upperSetTemperature,
          lowerSetTemperature: data.lowerSetTemperature,
          upperTimerTime: data.upperTimerTime,
          lowerTimerTime: data.lowerTimerTime,
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
    navigate(`/project/log/${projectId}?category=Assembly&process=VD`);
  };

  const handleEdit = () => {
    navigate(`/project/log/${projectId}/vd/edit/${worklogId}`);
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
