import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getVdWorklog } from '../../../../../api/project/worklog';
import type { VdWorklog } from './VdTypes';
import styles from '../../../../../styles/project/worklog/common.module.css';
import { getErrorMessage } from '../../../../../api/errorHandler';

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

          // 섹션2 - LOT (오븐번호×층번호)
          upperLot11: data.upperLot11,
          upperLot12: data.upperLot12,
          upperLot13: data.upperLot13,
          upperLot21: data.upperLot21,
          upperLot22: data.upperLot22,
          upperLot23: data.upperLot23,
          upperLot31: data.upperLot31,
          upperLot32: data.upperLot32,
          upperLot33: data.upperLot33,
          lowerLot11: data.lowerLot11,
          lowerLot12: data.lowerLot12,
          lowerLot13: data.lowerLot13,
          lowerLot21: data.lowerLot21,
          lowerLot22: data.lowerLot22,
          lowerLot23: data.lowerLot23,
          lowerLot31: data.lowerLot31,
          lowerLot32: data.lowerLot32,
          lowerLot33: data.lowerLot33,

          // 섹션2 - 투입량
          upperLotQty11: data.upperLotQty11,
          upperLotQty12: data.upperLotQty12,
          upperLotQty13: data.upperLotQty13,
          upperLotQty21: data.upperLotQty21,
          upperLotQty22: data.upperLotQty22,
          upperLotQty23: data.upperLotQty23,
          upperLotQty31: data.upperLotQty31,
          upperLotQty32: data.upperLotQty32,
          upperLotQty33: data.upperLotQty33,
          lowerLotQty11: data.lowerLotQty11,
          lowerLotQty12: data.lowerLotQty12,
          lowerLotQty13: data.lowerLotQty13,
          lowerLotQty21: data.lowerLotQty21,
          lowerLotQty22: data.lowerLotQty22,
          lowerLotQty23: data.lowerLotQty23,
          lowerLotQty31: data.lowerLotQty31,
          lowerLotQty32: data.lowerLotQty32,
          lowerLotQty33: data.lowerLotQty33,

          // 섹션3 - 투입량/수분측정/시간
          upperInputQuantity1: data.upperInputQuantity1,
          upperInputQuantity2: data.upperInputQuantity2,
          upperInputQuantity3: data.upperInputQuantity3,
          upperMoistureMeasurement1: data.upperMoistureMeasurement1,
          upperMoistureMeasurement2: data.upperMoistureMeasurement2,
          upperMoistureMeasurement3: data.upperMoistureMeasurement3,
          upperInputOutputTime: data.upperInputOutputTime,
          lowerInputQuantity1: data.lowerInputQuantity1,
          lowerInputQuantity2: data.lowerInputQuantity2,
          lowerInputQuantity3: data.lowerInputQuantity3,
          lowerMoistureMeasurement1: data.lowerMoistureMeasurement1,
          lowerMoistureMeasurement2: data.lowerMoistureMeasurement2,
          lowerMoistureMeasurement3: data.lowerMoistureMeasurement3,
          lowerInputOutputTime: data.lowerInputOutputTime,

          // 섹션3 - 두께 (상부)
          upperThicknessBefore1F1: data.upperThicknessBefore1F1,
          upperThicknessBefore1F2: data.upperThicknessBefore1F2,
          upperThicknessBefore1F3: data.upperThicknessBefore1F3,
          upperThicknessBefore2F1: data.upperThicknessBefore2F1,
          upperThicknessBefore2F2: data.upperThicknessBefore2F2,
          upperThicknessBefore2F3: data.upperThicknessBefore2F3,
          upperThicknessBefore3F1: data.upperThicknessBefore3F1,
          upperThicknessBefore3F2: data.upperThicknessBefore3F2,
          upperThicknessBefore3F3: data.upperThicknessBefore3F3,
          upperThicknessAfter1F1: data.upperThicknessAfter1F1,
          upperThicknessAfter1F2: data.upperThicknessAfter1F2,
          upperThicknessAfter1F3: data.upperThicknessAfter1F3,
          upperThicknessAfter2F1: data.upperThicknessAfter2F1,
          upperThicknessAfter2F2: data.upperThicknessAfter2F2,
          upperThicknessAfter2F3: data.upperThicknessAfter2F3,
          upperThicknessAfter3F1: data.upperThicknessAfter3F1,
          upperThicknessAfter3F2: data.upperThicknessAfter3F2,
          upperThicknessAfter3F3: data.upperThicknessAfter3F3,

          // 섹션3 - 두께 (하부)
          lowerThicknessBefore1F1: data.lowerThicknessBefore1F1,
          lowerThicknessBefore1F2: data.lowerThicknessBefore1F2,
          lowerThicknessBefore1F3: data.lowerThicknessBefore1F3,
          lowerThicknessBefore2F1: data.lowerThicknessBefore2F1,
          lowerThicknessBefore2F2: data.lowerThicknessBefore2F2,
          lowerThicknessBefore2F3: data.lowerThicknessBefore2F3,
          lowerThicknessBefore3F1: data.lowerThicknessBefore3F1,
          lowerThicknessBefore3F2: data.lowerThicknessBefore3F2,
          lowerThicknessBefore3F3: data.lowerThicknessBefore3F3,
          lowerThicknessAfter1F1: data.lowerThicknessAfter1F1,
          lowerThicknessAfter1F2: data.lowerThicknessAfter1F2,
          lowerThicknessAfter1F3: data.lowerThicknessAfter1F3,
          lowerThicknessAfter2F1: data.lowerThicknessAfter2F1,
          lowerThicknessAfter2F2: data.lowerThicknessAfter2F2,
          lowerThicknessAfter2F3: data.lowerThicknessAfter2F3,
          lowerThicknessAfter3F1: data.lowerThicknessAfter3F1,
          lowerThicknessAfter3F2: data.lowerThicknessAfter3F2,
          lowerThicknessAfter3F3: data.lowerThicknessAfter3F3,

          // 섹션4 - 공정 조건
          vacuumDegreeSetting: data.vacuumDegreeSetting,
          upperSetTemperature: data.upperSetTemperature,
          lowerSetTemperature: data.lowerSetTemperature,
          upperTimerTime: data.upperTimerTime,
          lowerTimerTime: data.lowerTimerTime,
        };

        setCellValues(values);
      } catch (err: any) {
        console.error('작업일지 조회 실패:', err);
        alert(getErrorMessage(err, '작업일지를 불러오지 못했습니다.'));
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
        <ExcelRenderer workbook={workbook} editableRanges={[]} cellValues={cellValues} namedRanges={namedRanges} />
      </div>
    </div>
  );
}
