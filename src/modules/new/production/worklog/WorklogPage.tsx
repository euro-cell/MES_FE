import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SubmenuBar from '../../../../components/SubmenuBar';
import WorklogList from './WorklogList';
import { createProcessMenus, getProcessById } from './processConfig';
import { getPlanProjects } from '../plan/PlanService';
import type { PlanProject } from '../plan/PlanTypes';

export default function WorklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();

  const [project, setProject] = useState<PlanProject | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const processId = searchParams.get('process');
  const currentProcess = processId ? getProcessById(processId) : null;

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      try {
        const projects = await getPlanProjects();
        const found = projects.find(p => p.id === Number(projectId));
        setProject(found || null);
      } catch (err) {
        console.error('프로젝트 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (loading) return <p>데이터를 불러오는 중...</p>;
  if (!project) return <p>프로젝트를 찾을 수 없습니다.</p>;

  const processMenus = createProcessMenus(Number(projectId));

  return (
    <div>
      {/* 프로젝트 정보 헤더 */}
      <div style={{ background: '#f8fafc', marginBottom: '16px', borderRadius: '8px' }}>
        <h2>프로젝트: {project.name}</h2>
      </div>

      {/* 공정 탭 메뉴 */}
      <SubmenuBar menus={processMenus} />

      {/* 선택된 공정의 작업일지 리스트 */}
      <div style={{ marginTop: '20px' }}>
        {currentProcess && processId && (
          <WorklogList projectId={Number(projectId)} processId={processId} processTitle={currentProcess.title} />
        )}
        {!processId && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            공정을 선택하면 작업일지 목록이 표시됩니다.
          </div>
        )}
      </div>
    </div>
  );
}
