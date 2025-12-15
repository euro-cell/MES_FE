import type { DashboardProject, DashboardProjectPlan } from '../../dashboard/types';

// 프로젝트 + 계획 정보
export interface StatusProject extends DashboardProject {
  plan?: DashboardProjectPlan;
}

// 월 메뉴 아이템
export interface MonthMenuItem {
  year: number;
  month: number;
  label: string; // "12월" or "2025년 1월"
  path: string;
}

// 양극/음극 타입 (전극 공정 전용)
export type ElectrodeType = 'cathode' | 'anode';

// 일별 생산 데이터
export interface DailyProductionData {
  date: string; // YYYY-MM-DD
  productionQuantity: number;
  ngQuantity: number;
  yield: number; // %
}

// 공정별 세부 항목 (예: V/D의 Cathode, Anode)
export interface ProcessSubItem {
  name: string; // "Cathode", "Anode", "외관", "용량" 등
  dailyData: Record<number, DailyProductionData>; // key: 일(1-31)
  totalProduction: number;
  totalNG: number;
  averageYield: number;
}

// 공정별 월간 데이터
export interface ProcessMonthlyData {
  processId: string; // 'VD', 'Forming' 등
  processTitle: string;
  subItems: ProcessSubItem[]; // 세부 항목 배열
  targetQuantity?: number; // 공정별 목표 수량 (선택적)
}

// 전체 월간 현황 데이터
export interface MonthlyStatusData {
  projectId: number;
  category: string; // 'Electrode', 'Assembly', 'Formation'
  electrodeType?: ElectrodeType; // 전극 공정일 경우
  year: number;
  month: number;
  processes: ProcessMonthlyData[];
  overallTotal: number; // 전체 합계
  overallProgress: number; // 전체 진행률
  startDate?: string; // 시작일 (YYYY-MM-DD)
  endDate?: string; // 종료일 (YYYY-MM-DD)
}

// 생산 현황 기본 정보 (startDate, endDate, name 조회용)
export interface ProductionStatusInfo {
  name: string; // 프로젝트 이름
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}
