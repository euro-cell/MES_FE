import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary, getProjectProgress } from '../../api/dashboard/DashboardService';
import type { DashboardProject, DashboardProjectWithPlan } from './types';

export const useDashboardProjects = () => {
  return useQuery({
    queryKey: ['dashboard', 'projects'],
    queryFn: async (): Promise<{
      projects: DashboardProject[];
      plans: DashboardProjectWithPlan[];
    }> => {
      const summaryItems = await getDashboardSummary();

      // Batch API 응답을 기존 타입에 맞게 변환
      const projects: DashboardProject[] = summaryItems.map((item) => ({
        id: item.id,
        name: item.name,
        company: item.company,
        customerId: item.customerId,
        customerName: item.customerName,
        mode: item.mode,
        year: item.year,
        month: item.month,
        round: item.round,
        batteryType: item.batteryType,
        capacity: item.capacity,
        targetQuantity: item.targetQuantity,
      }));

      const plans: DashboardProjectWithPlan[] = summaryItems.map((item) => ({
        project: {
          id: item.id,
          name: item.name,
          company: item.company,
          customerId: item.customerId,
          customerName: item.customerName,
          mode: item.mode,
          year: item.year,
          month: item.month,
          round: item.round,
          batteryType: item.batteryType,
          capacity: item.capacity,
          targetQuantity: item.targetQuantity,
        },
        plan: item.isPlan
          ? { startDate: item.startDate ?? '', endDate: item.endDate ?? undefined }
          : null,
        progress: item.progress.overall,
      }));

      return { projects, plans };
    },
  });
};

export const useProjectProgress = (projectId: number | null) => {
  return useQuery({
    queryKey: ['dashboard', 'progress', projectId],
    queryFn: () => getProjectProgress(projectId!),
    enabled: projectId !== null,
  });
};
