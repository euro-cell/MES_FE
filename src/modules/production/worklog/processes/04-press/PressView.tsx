import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelRenderer from '../../shared/ExcelRenderer';
import { useExcelTemplate } from '../../shared/useExcelTemplate';
import { useNamedRanges } from '../../shared/useNamedRanges';
import { getPressWorklog } from './PressService';
import { getProject } from '../../WorklogService';
import type { PressWorklog } from './PressTypes';
import type { WorklogProject } from '../../WorklogTypes';
import styles from '../../../../../styles/production/worklog/common.module.css';

export default function PressView() {
  const { projectId, worklogId } = useParams<{ projectId: string; worklogId: string }>();
  const navigate = useNavigate();

  const { workbook, loading: templateLoading, error: templateError } = useExcelTemplate('Press');
  const { namedRanges } = useNamedRanges(workbook);

  const [project, setProject] = useState<WorklogProject | null>(null);
  const [worklog, setWorklog] = useState<PressWorklog | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // 프로젝트 정보 로드
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

  // 작업일지 데이터 로드
  useEffect(() => {
    const loadWorklog = async () => {
      if (!projectId || !worklogId || Object.keys(namedRanges).length === 0) return;

      setLoading(true);
      try {
        const data = await getPressWorklog(Number(projectId), Number(worklogId));
        setWorklog(data);

        // namedRanges 기반으로 동적으로 cellValues 생성
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
        alert('작업일지를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWorklog();
  }, [projectId, worklogId, namedRanges, project]);

  const handleBack = () => {
    navigate(`/prod/log/${projectId}?category=Electrode&process=Press`);
  };

  const handleEdit = () => {
    navigate(`/prod/log/${projectId}/press/edit/${worklogId}`);
  };

  if (templateLoading || loading) return <p>데이터를 불러오는 중...</p>;
  if (templateError) return <p>템플릿 로드 실패: {templateError.message}</p>;
  if (!workbook || !worklog) return <p>데이터를 불러올 수 없습니다.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Press 작업일지 조회</h2>
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
        />
      </div>
    </div>
  );
}
