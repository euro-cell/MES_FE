export interface InOutFormData {
  cellLotType: 'in' | 'out' | 'restock';
  cellLotDate: string;
  cellLot: string;
  inPerson: string;
  outPerson: string;
  shippingStatus: string;
  projectName: string;
  model: string;
  grade: string;
  ncrGrade: string;
  storageLocation: string;
  projectNo: string;
  details: string;
}

export interface TableData {
  projectName: string;
  grade: string;
  totalQty: number | null;
  holdingQty: number | null;
  inboundQty: number | null;
  outboundQty: number | null;
  other: string;
}

export interface GroupedTableData {
  projectName: string;
  rows: TableData[];
}

export interface CellInventoryRequest {
  lot: string;
  date: string;
  receiver: string;
  deliverer: string;
  projectName: string;
  model?: string;
  grade: string;
  ncrGrade?: string;
  storageLocation?: string;
  projectNo?: string;
  details?: string;
  shippingStatus?: string;
  isRestocked?: boolean;
}

export interface CellInventoryResponse {
  id: number;
}

export interface GradeStatistics {
  grade: '양품' | 'NCR' | 'NG';
  inStock: number;
  shipped: number;
  available: number;
}

export interface ProjectStatistics {
  projectName: string;
  grades: GradeStatistics[];
  totalAvailable: number;
}

export type CellInventoryStatisticsResponse = ProjectStatistics[];
