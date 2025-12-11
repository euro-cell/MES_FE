import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { extractNamedRanges } from '../../shared/excelUtils';
import { getStackingWorklog } from './StackingService';
import type { StackingWorklog } from './StackingTypes';
import styles from '../../../../../../styles/production/worklog/StackingView.module.css';

export default function StackingView() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Stacking');
  const [worklog, setWorklog] = useState<StackingWorklog | null>(null);
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
        const data = await getStackingWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);
        setCellValues({ ...data, workDate: data.workDate, round: data.round });
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
        <h2>Stack 작업일지 조회</h2>
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
