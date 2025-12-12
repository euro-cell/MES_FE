import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getNotchingWorklog } from './NotchingService';
import type { NotchingWorklog } from './NotchingTypes';
import styles from '../../../../../styles/production/worklog/common.module.css';

export default function NotchingView() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Notching');
  const [worklog, setWorklog] = useState<NotchingWorklog | null>(null);
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
        const data = await getNotchingWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        // 데이터를 cellValues로 변환
        const values: Record<string, any> = {
          workDate: data.workDate,
          round: data.round,

          // A. 자재 투입 정보
          pressRollLot1: data.pressRollLot1,
          pressRollLot2: data.pressRollLot2,
          pressRollLot3: data.pressRollLot3,
          pressRollLot4: data.pressRollLot4,
          pressRollLot5: data.pressRollLot5,

          // B. 생산 정보 - 1차
          pressLot1: data.pressLot1,
          pressQuantity1: data.pressQuantity1,
          notchingLot1: data.notchingLot1,
          notchingQuantity1: data.notchingQuantity1,
          defectQuantity1: data.defectQuantity1,
          goodQuantity1: data.goodQuantity1,
          dimension1: data.dimension1,
          burr1: data.burr1,
          damage1: data.damage1,
          nonCutting1: data.nonCutting1,
          overTab1: data.overTab1,
          wide1: data.wide1,
          length1: data.length1,
          missMatch1: data.missMatch1,

          // B. 생산 정보 - 2차
          pressLot2: data.pressLot2,
          pressQuantity2: data.pressQuantity2,
          notchingLot2: data.notchingLot2,
          notchingQuantity2: data.notchingQuantity2,
          defectQuantity2: data.defectQuantity2,
          goodQuantity2: data.goodQuantity2,
          dimension2: data.dimension2,
          burr2: data.burr2,
          damage2: data.damage2,
          nonCutting2: data.nonCutting2,
          overTab2: data.overTab2,
          wide2: data.wide2,
          length2: data.length2,
          missMatch2: data.missMatch2,

          // B. 생산 정보 - 3차
          pressLot3: data.pressLot3,
          pressQuantity3: data.pressQuantity3,
          notchingLot3: data.notchingLot3,
          notchingQuantity3: data.notchingQuantity3,
          defectQuantity3: data.defectQuantity3,
          goodQuantity3: data.goodQuantity3,
          dimension3: data.dimension3,
          burr3: data.burr3,
          damage3: data.damage3,
          nonCutting3: data.nonCutting3,
          overTab3: data.overTab3,
          wide3: data.wide3,
          length3: data.length3,
          missMatch3: data.missMatch3,

          // B. 생산 정보 - 4차
          pressLot4: data.pressLot4,
          pressQuantity4: data.pressQuantity4,
          notchingLot4: data.notchingLot4,
          notchingQuantity4: data.notchingQuantity4,
          defectQuantity4: data.defectQuantity4,
          goodQuantity4: data.goodQuantity4,
          dimension4: data.dimension4,
          burr4: data.burr4,
          damage4: data.damage4,
          nonCutting4: data.nonCutting4,
          overTab4: data.overTab4,
          wide4: data.wide4,
          length4: data.length4,
          missMatch4: data.missMatch4,

          // B. 생산 정보 - 5차
          pressLot5: data.pressLot5,
          pressQuantity5: data.pressQuantity5,
          notchingLot5: data.notchingLot5,
          notchingQuantity5: data.notchingQuantity5,
          defectQuantity5: data.defectQuantity5,
          goodQuantity5: data.goodQuantity5,
          dimension5: data.dimension5,
          burr5: data.burr5,
          damage5: data.damage5,
          nonCutting5: data.nonCutting5,
          overTab5: data.overTab5,
          wide5: data.wide5,
          length5: data.length5,
          missMatch5: data.missMatch5,

          // C. 공정 조건
          tension: data.tension,
          punchingSpeed: data.punchingSpeed,
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
        <h2>Notching 작업일지 조회</h2>
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
        <button className={styles.btnBack} onClick={() => navigate(`/prod/log/${projectId}?category=Electrode&process=Notching`)}>
          목록으로
        </button>
      </div>
    </div>
  );
}
