import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { getCoatingWorklog } from './CoatingService';
import type { CoatingWorklog } from './CoatingTypes';
import { getProject } from '../../WorklogService';
import type { WorklogProject } from '../../WorklogTypes';
import styles from '../../../../../../styles/production/worklog/CoatingView.module.css';

export default function CoatingView() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('coating');
  const { namedRanges } = useNamedRanges(workbook);

  const [project, setProject] = useState<WorklogProject | null>(null);
  const [worklogData, setWorklogData] = useState<CoatingWorklog | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      try {
        const projectData = await getProject(Number(projectId));
        setProject(projectData);
      } catch (err) {
        console.error('프로젝트 조회 실패:', err);
      }
    };
    loadProject();
  }, [projectId]);

  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getCoatingWorklog(Number(projectId), Number(worklogId));
        setWorklogData(data);

        const values: Record<string, any> = {};
        Object.keys(namedRanges).forEach(rangeName => {
          if (rangeName === 'productionId' && project) {
            values[rangeName] = project.name;
          } else {
            values[rangeName] = (data as any)[rangeName] ?? '';
          }
        });
        setCellValues(values);
      } catch (err) {
        console.error('작업일지 조회 실패:', err);
        alert('작업일지를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId, namedRanges, project]);

  const handleBack = () => {
    navigate(`/prod/log/${projectId}?category=Electrode&process=Coating`);
  };

  const handleEdit = () => {
    navigate(`/prod/log/${projectId}/coating/edit/${worklogId}`);
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
        <div>
          <h2>Coating 작업일지 조회</h2>
          {project && <p className={styles.projectName}>프로젝트: {project.name}</p>}
        </div>
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
          multilineFields={[]}
          timeFields={[]}
        />
      </div>
    </div>
  );
}
