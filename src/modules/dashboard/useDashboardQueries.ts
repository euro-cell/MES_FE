import { useQuery } from '@tanstack/react-query';
import { getAllProductions, getProductionPlan, getProductionProgress } from './dashboardService';
import type { DashboardProject, DashboardProjectWithPlan } from './types';

export const useDashboardProjects = () => {
  return useQuery({
    queryKey: ['dashboard', 'projects'],
    queryFn: async (): Promise<{
      projects: DashboardProject[];
      plans: DashboardProjectWithPlan[];
    }> => {
      const projects = await getAllProductions();

      // 모든 프로젝트의 plan과 progress를 병렬로 조회
      const plans = await Promise.all(
        projects.map(async (project) => {
          const [plan, progressData] = await Promise.all([
            getProductionPlan(project.id),
            getProductionProgress(project.id).catch(() => null),
          ]);

          return {
            project,
            plan,
            progress: progressData?.overall,
          };
        })
      );

      return { projects, plans };
    },
  });
};

export const useProductionProgress = (projectId: number | null) => {
  return useQuery({
    queryKey: ['dashboard', 'progress', projectId],
    queryFn: () => getProductionProgress(projectId!),
    enabled: projectId !== null,
  });
};
