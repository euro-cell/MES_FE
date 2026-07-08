/** ✅ 프로젝트 기본 정보 */
export interface DashboardProject {
  id: number;
  name: string;
  company: string;       // 약어 (shortName)
  customerId?: number | null; // Customer FK
  customerName?: string; // 회사명 (Customer.name)
  mode: string;
  year: number;
  month: number;
  round: number;
  batteryType: string;
  capacity: number;
  targetQuantity: number;
}

/** ✅ 프로젝트 일정 정보 */
export interface DashboardProjectPlan {
  startDate: string;
  endDate?: string;
}

/** ✅ 프로젝트 진행률 데이터 */
export interface DashboardProgressData {
  electrode: string; // 전극
  assembly: string; // 조립
  formation: string; // 화성
}

/** ✅ API 응답: 프로젝트 진행률 */
export interface ProductionProgressResponse {
  electrode: number; // 전극 진행률 (0-100)
  assembly: number; // 조립 진행률 (0-100)
  formation: number; // 화성 진행률 (0-100)
  overall: number; // 전체 진행률 (0-100)
}

/** ✅ 프로젝트 + 일정 결합 데이터 */
export interface DashboardProjectWithPlan {
  project: DashboardProject;
  plan: DashboardProjectPlan | null;
  progress?: number; // 전체 진행률 (overall)
}

/** ✅ 등록 폼 상태 */
export interface DashboardFormState {
  company: string;
  customerId?: number | null;
  mode: string;
  year: number;
  month: number;
  round: number;
  batteryType: string;
  capacity: string | number;
  targetQuantity: number;
}

/** ✅ Batch API 응답: 대시보드 요약 */
export interface DashboardSummaryItem {
  id: number;
  name: string;
  company: string;
  customerId?: number | null;
  customerName?: string;
  mode: string;
  year: number;
  month: number;
  round: number;
  batteryType: string;
  capacity: number;
  targetQuantity: number;
  isPlan: boolean;
  startDate: string | null;
  endDate: string | null;
  progress: {
    electrode: number;
    assembly: number;
    formation: number;
    overall?: number;
  };
}
