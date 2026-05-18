import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { getFormingWorklog } from '../../../../../api/project/worklog';
import type { FormingWorklog } from './FormingTypes';
import styles from '../../../../../styles/project/worklog/common.module.css';
import { getErrorMessage } from '../../../../../api/errorHandler';

export default function FormingView() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Forming');
  const { namedRanges } = useNamedRanges(workbook);
  const [worklog, setWorklog] = useState<FormingWorklog | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      try {
        const data = await getFormingWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        const values: Record<string, any> = {};
        Object.keys(namedRanges).forEach(rangeName => {
          values[rangeName] = (data as any)[rangeName] ?? '';
        });

        setCellValues(values);
      } catch (err: any) {
        console.error('작업일지 조회 실패:', err);
        alert(getErrorMessage(err, '작업일지를 불러오지 못했습니다.'));
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId, namedRanges]);

  const handleBack = () => {
    navigate(`/project/log/${projectId}?category=Assembly&process=Forming`);
  };

  const handleEdit = () => {
    navigate(`/project/log/${projectId}/forming/edit/${worklogId}`);
  };

  if (templateLoading || loading) return <p>데이터를 불러오는 중...</p>;
  if (templateError) return <p>템플릿 로드 실패: {templateError.message}</p>;
  if (!workbook || !worklog) return <p>데이터를 불러올 수 없습니다.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Forming 작업일지 조회</h2>
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
