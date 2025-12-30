import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { mapFormToPayload } from '../../shared/excelUtils';
import { getNotchingWorklog, updateNotchingWorklog } from './NotchingService';
import type { NotchingWorklog, NotchingWorklogPayload } from './NotchingTypes';
import styles from '../../../../../styles/production/worklog/common.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';
import { NOTCHING_NUMERIC_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';

export default function NotchingEdit() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Notching');
  const { namedRanges } = useNamedRanges(workbook);

  const [worklog, setWorklog] = useState<NotchingWorklog | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<WorklogProject | null>(null);

  // 프로젝트 정보 로드
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      try {
        const proj = await getProject(Number(projectId));
        setProject(proj);
      } catch (err) {
        console.error('프로젝트 조회 실패:', err);
      }
    };
    loadProject();
  }, [projectId]);

  // 작업일지 데이터 로드
  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getNotchingWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        // namedRanges 기반으로 동적으로 formValues 생성
        const values: Record<string, any> = {};
        Object.keys(namedRanges).forEach(rangeName => {
          if (rangeName === 'productionId' && project) {
            values[rangeName] = project.name;
          } else {
            values[rangeName] = (data as any)[rangeName] ?? '';
          }
        });

        setFormValues(values);
      } catch (err) {
        console.error('작업일지 조회 실패:', err);
        alert('작업일지를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId, namedRanges, project]);

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => ({ ...prev, [rangeName]: value }));
  };

  const handleSubmit = async () => {
    if (!projectId || !worklogId) return;

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, NOTCHING_NUMERIC_FIELDS) as NotchingWorklogPayload;
      await updateNotchingWorklog(Number(projectId), Number(worklogId), payload);
      alert('Notching 작업일지가 수정되었습니다.');
      navigate(`/prod/log/${projectId}?category=Electrode&process=Notching`);
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정 실패: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (templateLoading || loading) return <p>데이터를 불러오는 중...</p>;
  if (templateError) return <p>템플릿 로드 실패: {templateError.message}</p>;
  if (!workbook || !worklog) return <p>데이터를 불러올 수 없습니다.</p>;

  const editableRanges = Object.keys(namedRanges).filter(name => !COMMON_READONLY_FIELDS.includes(name));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Notching 작업일지 수정</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
        </div>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={() => navigate(`/prod/log/${projectId}?category=Electrode&process=Notching`)}>
            취소
          </button>
          <button className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '수정 중...' : '수정'}
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
        numericFields={NOTCHING_NUMERIC_FIELDS}
        readOnlyFields={COMMON_READONLY_FIELDS}
      />
    </div>
  );
}
