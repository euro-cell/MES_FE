import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getPressWorklog } from './PressService';
import type { PressWorklog } from './PressTypes';
import styles from '../../../../../styles/production/worklog/common.module.css';

export default function PressView() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Press');
  const [worklog, setWorklog] = useState<PressWorklog | null>(null);
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
        const data = await getPressWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        // 데이터를 cellValues로 변환
        const values: Record<string, any> = {
          workDate: data.workDate,
          round: data.round,

          // A. 자재 투입 정보
          coatingRollLot1: data.coatingRollLot1,
          coatingRollLot2: data.coatingRollLot2,
          coatingRollLot3: data.coatingRollLot3,
          coatingRollLot4: data.coatingRollLot4,
          coatingRollLot5: data.coatingRollLot5,
          targetThickness: data.targetThickness,

          // B. 생산 정보 - 1차
          coatingLot1: data.coatingLot1,
          pressLot1: data.pressLot1,
          coatingQuantity1: data.coatingQuantity1,
          pressQuantity1: data.pressQuantity1,
          weightPerAreaFront1M: data.weightPerAreaFront1M,
          weightPerAreaFront1C: data.weightPerAreaFront1C,
          weightPerAreaFront1D: data.weightPerAreaFront1D,
          weightPerAreaRear1M: data.weightPerAreaRear1M,
          weightPerAreaRear1C: data.weightPerAreaRear1C,
          weightPerAreaRear1D: data.weightPerAreaRear1D,
          thicknessFront1M: data.thicknessFront1M,
          thicknessFront1C: data.thicknessFront1C,
          thicknessFront1D: data.thicknessFront1D,
          thicknessRear1M: data.thicknessRear1M,
          thicknessRear1C: data.thicknessRear1C,
          thicknessRear1D: data.thicknessRear1D,

          // B. 생산 정보 - 2차
          coatingLot2: data.coatingLot2,
          pressLot2: data.pressLot2,
          coatingQuantity2: data.coatingQuantity2,
          pressQuantity2: data.pressQuantity2,
          weightPerAreaFront2M: data.weightPerAreaFront2M,
          weightPerAreaFront2C: data.weightPerAreaFront2C,
          weightPerAreaFront2D: data.weightPerAreaFront2D,
          weightPerAreaRear2M: data.weightPerAreaRear2M,
          weightPerAreaRear2C: data.weightPerAreaRear2C,
          weightPerAreaRear2D: data.weightPerAreaRear2D,
          thicknessFront2M: data.thicknessFront2M,
          thicknessFront2C: data.thicknessFront2C,
          thicknessFront2D: data.thicknessFront2D,
          thicknessRear2M: data.thicknessRear2M,
          thicknessRear2C: data.thicknessRear2C,
          thicknessRear2D: data.thicknessRear2D,

          // B. 생산 정보 - 3차
          coatingLot3: data.coatingLot3,
          pressLot3: data.pressLot3,
          coatingQuantity3: data.coatingQuantity3,
          pressQuantity3: data.pressQuantity3,
          weightPerAreaFront3M: data.weightPerAreaFront3M,
          weightPerAreaFront3C: data.weightPerAreaFront3C,
          weightPerAreaFront3D: data.weightPerAreaFront3D,
          weightPerAreaRear3M: data.weightPerAreaRear3M,
          weightPerAreaRear3C: data.weightPerAreaRear3C,
          weightPerAreaRear3D: data.weightPerAreaRear3D,
          thicknessFront3M: data.thicknessFront3M,
          thicknessFront3C: data.thicknessFront3C,
          thicknessFront3D: data.thicknessFront3D,
          thicknessRear3M: data.thicknessRear3M,
          thicknessRear3C: data.thicknessRear3C,
          thicknessRear3D: data.thicknessRear3D,

          // B. 생산 정보 - 4차
          coatingLot4: data.coatingLot4,
          pressLot4: data.pressLot4,
          coatingQuantity4: data.coatingQuantity4,
          pressQuantity4: data.pressQuantity4,
          weightPerAreaFront4M: data.weightPerAreaFront4M,
          weightPerAreaFront4C: data.weightPerAreaFront4C,
          weightPerAreaFront4D: data.weightPerAreaFront4D,
          weightPerAreaRear4M: data.weightPerAreaRear4M,
          weightPerAreaRear4C: data.weightPerAreaRear4C,
          weightPerAreaRear4D: data.weightPerAreaRear4D,
          thicknessFront4M: data.thicknessFront4M,
          thicknessFront4C: data.thicknessFront4C,
          thicknessFront4D: data.thicknessFront4D,
          thicknessRear4M: data.thicknessRear4M,
          thicknessRear4C: data.thicknessRear4C,
          thicknessRear4D: data.thicknessRear4D,

          // B. 생산 정보 - 5차
          coatingLot5: data.coatingLot5,
          pressLot5: data.pressLot5,
          coatingQuantity5: data.coatingQuantity5,
          pressQuantity5: data.pressQuantity5,
          weightPerAreaFront5M: data.weightPerAreaFront5M,
          weightPerAreaFront5C: data.weightPerAreaFront5C,
          weightPerAreaFront5D: data.weightPerAreaFront5D,
          weightPerAreaRear5M: data.weightPerAreaRear5M,
          weightPerAreaRear5C: data.weightPerAreaRear5C,
          weightPerAreaRear5D: data.weightPerAreaRear5D,
          thicknessFront5M: data.thicknessFront5M,
          thicknessFront5C: data.thicknessFront5C,
          thicknessFront5D: data.thicknessFront5D,
          thicknessRear5M: data.thicknessRear5M,
          thicknessRear5C: data.thicknessRear5C,
          thicknessRear5D: data.thicknessRear5D,

          // C. 공정 조건
          tensionUnT: data.tensionUnT,
          tensionReT: data.tensionReT,
          pressSpeed: data.pressSpeed,
          pressureCondition: data.pressureCondition,
          rollGapLeft: data.rollGapLeft,
          rollGapRight: data.rollGapRight,
          rollTemperatureMain: data.rollTemperatureMain,
          rollTemperatureInfeed: data.rollTemperatureInfeed,
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

  if (templateLoading || loading) return <p>데이터를 불러오는 중...</p>;
  if (templateError) return <p>템플릿 로드 실패: {templateError.message}</p>;
  if (!workbook || !worklog) return <p>데이터를 불러올 수 없습니다.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Press 작업일지 조회</h2>
        <div className={styles.info}>
          <span>작성자: {worklog.writer}</span>
          <span>작성일: {new Date(worklog.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <ExcelRenderer
        workbook={workbook}
        editableRanges={[]}
        cellValues={cellValues}
        namedRanges={namedRanges}
        className={styles.excelRenderer}
      />

      <div className={styles.actions}>
        <button className={styles.btnBack} onClick={() => navigate(`/prod/log/${projectId}?category=Electrode&process=Press`)}>
          목록으로
        </button>
      </div>
    </div>
  );
}
