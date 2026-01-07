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
  totalQty: number;
  holdingQty: number;
  inboundQty: number;
  outboundQty: number;
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
