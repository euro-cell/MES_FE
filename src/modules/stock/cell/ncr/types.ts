// ===== 실제 API 응답 타입 (NEW) =====
export interface ProjectCount {
  projectNo: string | null;  // 구형 프로젝트 번호 (예: "V5") 또는 null (신형 프로젝트)
  projectName: string;       // 프로젝트 이름 (예: "5.2", "55D25B1-KKK55")
  count: number;             // 이 프로젝트에서 이 NCR의 개수
}

export interface ProjectHeader {
  projectNo: string | null;  // 구형: "V5" 등, 신형: null
  projectName: string;       // 프로젝트 이름
}

export interface NCRStatusItemAPI {
  id: number;                // cell_ncrs 테이블 ID
  category: 'Formation' | 'Inspection' | 'Other';
  ncrType: string;           // NCR1, NCR2, ...
  title: string;             // 세부사항
  code: string;              // 표기
  counts: ProjectCount[];    // 프로젝트별 카운트
}

export interface NCRStatisticsResponse {
  data: NCRStatusItemAPI[];
  projects: ProjectHeader[];
}

// ===== 레거시 더미 데이터 타입 =====
export interface NCRStatusItem {
  ncrType: string;           // NCR1, NCR2, ...
  details: string;           // 세부사항
  code: string;              // 표기 (F-NCR1, NCR1, ...)
  v52: number;               // UFC V5.2
  v55: number;               // V5.5
  v56: number;               // V5.6
  v57: number;               // V5.7
  v58: number;               // V5.8
  navitas6T: number;         // Navitas 6T
  kkk55d25b1?: number;       // 55D25B1-KKK55
}

export interface NCRSection {
  section: 'Formation' | 'Inspection' | 'Other';
  items: NCRStatusItem[];
}

export interface NCRStatusData {
  formation: NCRStatusItem[];
  inspection: NCRStatusItem[];
  other: NCRStatusItem[];
}
