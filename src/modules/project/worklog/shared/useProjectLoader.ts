import { useState, useEffect } from 'react';
import { getProject } from '../WorklogService';
import type { WorklogProject } from '../WorklogTypes';

/**
 * 프로젝트 정보를 로드하는 커스텀 훅
 * @param projectId - 프로젝트 ID (string 또는 undefined)
 * @returns project 정보
 */
export function useProjectLoader(projectId?: string) {
  const [project, setProject] = useState<WorklogProject | null>(null);

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

  return project;
}
