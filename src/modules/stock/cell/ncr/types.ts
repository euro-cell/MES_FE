// NCR Status Table types
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
