import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { getSlurryWorklog } from './SlurryService';
import type { SlurryWorklog } from './SlurryTypes';
import { SLURRY_TIME_FIELDS, SLURRY_MULTILINE_FIELDS } from './slurryConstants';
import styles from '../../../../../styles/production/worklog/common.module.css';

export default function SlurryView() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('slurry');
  const { namedRanges } = useNamedRanges(workbook);

  const [worklogData, setWorklogData] = useState<SlurryWorklog | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getSlurryWorklog(Number(projectId), Number(worklogId));
        setWorklogData(data);

        // Named Range에 데이터 매핑
        const values: Record<string, any> = {};
        Object.keys(namedRanges).forEach(rangeName => {
          values[rangeName] = (data as any)[rangeName] ?? '';
        });
        setCellValues(values);
      } catch (err) {
        console.error('작업일지 조회 실패:', err);
        alert('작업일지를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, worklogId, namedRanges]);

  const handleBack = () => {
    navigate(`/prod/log/${projectId}?category=Electrode&process=Slurry`);
  };

  const handleEdit = () => {
    navigate(`/prod/log/${projectId}/slurry/edit/${worklogId}`);
  };

  if (templateLoading || loading) {
    return (
      <div className={styles.container}>
        <p>작업일지를 불러오는 중...</p>
      </div>
    );
  }

  if (templateError) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>엑셀 템플릿 로드 실패: {templateError.message}</p>
      </div>
    );
  }

  if (!workbook || !worklogData) {
    return (
      <div className={styles.container}>
        <p>작업일지를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Slurry 작업일지 조회</h2>
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
          editableRanges={[]} // 읽기 전용
          cellValues={cellValues}
          namedRanges={namedRanges}
          multilineFields={SLURRY_MULTILINE_FIELDS}
          timeFields={SLURRY_TIME_FIELDS}
        />
      </div>
    </div>
  );
}
