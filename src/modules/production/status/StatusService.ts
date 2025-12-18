import axios from 'axios';
import { getPlanProjects, getProductionPlan } from '../plan/PlanService';
import { getProcessesByCategory } from './statusConfig';
import type { StatusProject, MonthlyStatusData, ElectrodeType, ProductionStatusInfo, UpdateTargetRequest } from './StatusTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

// 생산 현황 기본 정보 조회 (startDate, endDate)
export async function getProductionStatusInfo(productionId: number): Promise<ProductionStatusInfo> {
  try {
    const response = await axios.get(`${API_BASE}/production/${productionId}/status`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('생산 현황 정보 조회 실패:', error);
    throw error;
  }
}

// 실제 데이터 조회 (백엔드 응답 형식 그대로)
export async function getRealMonthlyData(
  projectId: number,
  category: string,
  electrodeType: string | null,
  year: number,
  month: number
): Promise<any> {
  console.log(
    `실제 데이터 조회: projectId=${projectId}, category=${category}, type=${electrodeType}, ${year}-${month}`
  );

  try {
    const params = new URLSearchParams({
      month: `${year}-${String(month).padStart(2, '0')}`,
    });
    if (electrodeType) params.append('type', electrodeType);

    const response = await axios.get(`${API_BASE}/production/${projectId}/status/${category}?${params}`, {
      withCredentials: true,
    });

    console.log('🔍 실제 API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 실제 데이터 조회 실패:', error);
    return null;
  }
}

// 월간 생산 현황 조회 (목 데이터)
export async function getMonthlyStatusData(
  projectId: number,
  category: string,
  electrodeType: string | null,
  year: number,
  month: number
): Promise<MonthlyStatusData> {
  console.log(
    `월간 현황 조회: projectId=${projectId}, category=${category}, type=${electrodeType}, ${year}-${month}`
  );

  // 목 데이터 반환
  return getMockMonthlyData(projectId, category, electrodeType, year, month);
}

// 목표수량 수정 API
export async function updateTargetQuantity(
  productionId: number,
  request: UpdateTargetRequest
): Promise<void> {
  try {
    await axios.patch(`${API_BASE}/production/${productionId}/status/target`, request, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('목표수량 수정 실패:', error);
    throw error;
  }
}

// 단일 공정의 목 데이터 생성 함수
function generateMockProcess(process: any, year: number, month: number, idx: number = 0) {
  const daysInMonth = new Date(year, month, 0).getDate();
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

  // 공정별 목 데이터 생성
  const mockProcesses = processes.map((process, idx) => generateMockProcess(process, year, month, idx));

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
