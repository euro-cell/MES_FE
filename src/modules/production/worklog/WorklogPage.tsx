import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import WorklogList from './WorklogList';
import { createCategoryMenus, createProcessMenus, getProcessById } from './processConfig';
import { getPlanProjects } from '../plan/PlanService';
import type { PlanProject } from '../plan/PlanTypes';

export default function WorklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();

  const [project, setProject] = useState<PlanProject | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');
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

  const categoryMenus = createCategoryMenus(Number(projectId));
  const processMenus = category ? createProcessMenus(Number(projectId), category) : [];

  return (
    <div>
      {/* 프로젝트 정보 헤더 */}
      <div style={{ background: '#f8fafc', marginBottom: '16px', borderRadius: '8px' }}>
        <h2>프로젝트: {project.name}</h2>
      </div>

      {/* 카테고리 탭 메뉴 (1단계) */}
      <SubmenuBar menus={categoryMenus} />

      {/* 공정 탭 메뉴 (2단계) */}
      {category && (
        <div style={{ marginTop: '10px' }}>
          <SubmenuBar menus={processMenus} />
        </div>
      )}

      {/* 선택된 공정의 작업일지 리스트 */}
      <div style={{ marginTop: '20px' }}>
        {currentProcess && processId && (
          <WorklogList projectId={Number(projectId)} processId={processId} processTitle={currentProcess.title} />
        )}
        {!category && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>공정 카테고리를 선택하세요.</div>
        )}
        {category && !processId && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            공정을 선택하면 작업일지 목록이 표시됩니다.
          </div>
        )}
      </div>
    </div>
  );
}
