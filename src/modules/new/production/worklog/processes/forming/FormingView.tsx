import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getFormingWorklog } from './FormingService';
import type { FormingWorklog } from './FormingTypes';
import styles from '../../../../../../styles/production/worklog/FormingView.module.css';

export default function FormingView() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Forming');
  const [worklog, setWorklog] = useState<FormingWorklog | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, any>>({});
  const [namedRanges, setNamedRanges] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workbook) {
      const ranges = extractNamedRanges(workbook);
      setNamedRanges(ranges);
    }
  }, [workbook]);

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId) return;

      try {
        const data = await getFormingWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        const values: Record<string, any> = {
          workDate: data.workDate,
          round: data.round,

          // A. 자재 투입 정보
          pouchLot: data.pouchLot,
          pouchManufacturer: data.pouchManufacturer,
          pouchSpec: data.pouchSpec,
          pouchUsage: data.pouchUsage,

          // B. 생산 정보 - 컷팅
          cuttingWorkQuantity: data.cuttingWorkQuantity,
          cuttingGoodQuantity: data.cuttingGoodQuantity,
          cuttingDefectQuantity: data.cuttingDefectQuantity,
          cuttingDiscardQuantity: data.cuttingDiscardQuantity,
          cuttingDefectRate: data.cuttingDefectRate,

          // B. 생산 정보 - 포밍
          formingWorkQuantity: data.formingWorkQuantity,
          formingGoodQuantity: data.formingGoodQuantity,
          formingDefectQuantity: data.formingDefectQuantity,
          formingDiscardQuantity: data.formingDiscardQuantity,
          formingDefectRate: data.formingDefectRate,

          // B. 생산 정보 - 폴딩
          foldingWorkQuantity: data.foldingWorkQuantity,
          foldingGoodQuantity: data.foldingGoodQuantity,
          foldingDefectQuantity: data.foldingDefectQuantity,
          foldingDiscardQuantity: data.foldingDiscardQuantity,
          foldingDefectRate: data.foldingDefectRate,

          // B. 생산 정보 - 탑컷팅
          topCuttingWorkQuantity: data.topCuttingWorkQuantity,
          topCuttingGoodQuantity: data.topCuttingGoodQuantity,
          topCuttingDefectQuantity: data.topCuttingDefectQuantity,
          topCuttingDiscardQuantity: data.topCuttingDiscardQuantity,
          topCuttingDefectRate: data.topCuttingDefectRate,

          // C. 공정 조건
          cuttingLength: data.cuttingLength,
          cuttingChecklist: data.cuttingChecklist,
          formingDepth: data.formingDepth,
          formingStopperHeight: data.formingStopperHeight,
          formingChecklist: data.formingChecklist,
          topCuttingLength: data.topCuttingLength,
          topCuttingChecklist: data.topCuttingChecklist,
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
        <h2>Forming 작업일지 조회</h2>
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
        <button className={styles.btnBack} onClick={() => navigate(`/prod/log/${projectId}`)}>
          목록으로
        </button>
      </div>
    </div>
  );
}
