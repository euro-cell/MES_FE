import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { mapFormToPayload } from '../../shared/excelUtils';
import { createNotchingWorklog } from './NotchingService';
import type { NotchingWorklogPayload } from './NotchingTypes';
import styles from '../../../../../styles/production/worklog/common.module.css';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';
import { NOTCHING_NUMERIC_FIELDS } from '../../shared/numericFields';
import { COMMON_READONLY_FIELDS } from '../../shared/commonConstants';

export default function NotchingRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Notching');
  const { namedRanges } = useNamedRanges(workbook);

  const [project, setProject] = useState<WorklogProject | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

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

  // 초기 폼 값 설정
  useEffect(() => {
    if (Object.keys(namedRanges).length > 0) {
      const initialValues: Record<string, any> = {};
      Object.keys(namedRanges).forEach(rangeName => {
        if (rangeName === 'productionId' && project) {
          initialValues[rangeName] = project.name;
        } else {
          const defaultValue = namedRanges[rangeName]?.value;
          initialValues[rangeName] = defaultValue ?? '';
        }
      });
      setFormValues(initialValues);
    }
  }, [namedRanges, project]);

  const handleCellChange = (rangeName: string, value: any) => {
    setFormValues(prev => ({ ...prev, [rangeName]: value }));
  };

  const handleSubmit = async () => {
    if (!projectId) return;

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(formValues, namedRanges, NOTCHING_NUMERIC_FIELDS) as NotchingWorklogPayload;
      await createNotchingWorklog(Number(projectId), payload);
      alert('Notching 작업일지가 등록되었습니다.');
      navigate(`/prod/log/${projectId}?category=Electrode&process=Notching`);
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 실패: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (templateLoading) return <p>템플릿을 불러오는 중...</p>;
  if (templateError) return <p>템플릿 로드 실패: {templateError.message}</p>;
  if (!workbook) return <p>엑셀 데이터를 불러올 수 없습니다.</p>;

  const editableRanges = Object.keys(namedRanges).filter(name => !COMMON_READONLY_FIELDS.includes(name));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Notching 작업일지 등록</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.btnCancel}
            onClick={() => navigate(`/prod/log/${projectId}?category=Electrode&process=Notching`)}
          >
            취소
          </button>
          <button className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '등록 중...' : '등록'}
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
