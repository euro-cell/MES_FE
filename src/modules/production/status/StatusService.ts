import { getPlanProjects, getProductionPlan } from '../plan/PlanService';
import { getProcessesByCategory } from './statusConfig';
import type { StatusProject, MonthlyStatusData, ElectrodeType } from './StatusTypes';

// 프로젝트 목록 조회 (기존 API 재사용)
export async function getStatusProjects(): Promise<StatusProject[]> {
  try {
    const projects = await getPlanProjects();

    // 각 프로젝트의 plan 데이터를 별도로 조회
    const projectsWithPlan = await Promise.all(
      projects.map(async project => {
        try {
          const planData = await getProductionPlan(project.id);
          // plan이 배열로 반환되는 경우 첫 번째 요소를 추출
          const plan = Array.isArray(planData) ? planData[0] : planData;
          return { ...project, plan };
        } catch (err) {
          // plan 데이터가 없는 경우 null로 처리
          console.warn(`프로젝트 ${project.id}의 계획 데이터가 없습니다.`);
          return { ...project, plan: null };
        }
      })
    );

    return projectsWithPlan;
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    return [];
  }
}

// 월간 생산 현황 조회 (현재: 목 데이터만 반환)
export async function getMonthlyStatusData(
  projectId: number,
  category: string,
  electrodeType: string | null,
  year: number,
  month: number
): Promise<MonthlyStatusData> {
  console.log(
    `[목 데이터] 월간 현황 조회: projectId=${projectId}, category=${category}, type=${electrodeType}, ${year}-${month}`
  );

  // TODO: 백엔드 API 구현 후 실제 API 호출로 변경
  // const params = new URLSearchParams({
  //   category,
  //   year: String(year),
  //   month: String(month)
  // });
  // if (electrodeType) params.append('electrodeType', electrodeType);
  //
  // const response = await fetch(`${API_BASE}/production/${projectId}/status/monthly?${params}`);
  // return await response.json();

  // 현재는 목 데이터 반환
  return getMockMonthlyData(projectId, category, electrodeType, year, month);
}

// 목 데이터 생성 함수
function getMockMonthlyData(
  projectId: number,
  category: string,
  electrodeType: string | null,
  year: number,
  month: number
): MonthlyStatusData {
  const processes = getProcessesByCategory(category);
  const daysInMonth = new Date(year, month, 0).getDate();

  // 공정별 목 데이터 생성
  const mockProcesses = processes.map((process, idx) => {
    // 각 공정마다 다른 패턴의 데이터 생성
    const dailyData: Record<number, any> = {};

    // 랜덤하게 일부 날짜만 데이터 생성 (예: 5일, 7일, 10일, 15일, 20일)
    [5, 7, 10, 15, 20].forEach(day => {
      if (day <= daysInMonth) {
        dailyData[day] = {
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          productionQuantity: 100 + Math.floor(Math.random() * 50) * (idx + 1),
          ngQuantity: Math.floor(Math.random() * 10),
          yield: 90 + Math.floor(Math.random() * 10),
        };
      }
    });

    const totalProduction = Object.values(dailyData).reduce((sum: number, d: any) => sum + d.productionQuantity, 0);
    const totalNG = Object.values(dailyData).reduce((sum: number, d: any) => sum + d.ngQuantity, 0);

    return {
      processId: process.id,
      processTitle: process.title,
      subItems: [
        {
          name: 'Default', // 단순화: 세부 항목은 1개만
          dailyData,
          totalProduction,
          totalNG,
          averageYield: totalProduction > 0 ? ((totalProduction - totalNG) / totalProduction) * 100 : 100,
        },
      ],
      targetQuantity: 1000 + idx * 200, // 공정별로 다른 목표
    };
  });

  const overallTotal = mockProcesses.reduce(
    (sum, p) => sum + p.subItems.reduce((s, item) => s + item.totalProduction, 0),
    0
  );

  return {
    projectId,
    category,
    electrodeType: electrodeType as ElectrodeType,
    year,
    month,
    processes: mockProcesses,
    overallTotal,
    overallProgress: 50, // 임시로 50%
  };
}
