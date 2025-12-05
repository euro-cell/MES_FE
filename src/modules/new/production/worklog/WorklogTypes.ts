export interface WorklogProject {
  id: number;
  name: string;
  company: string;
  mode: string;
  year: number;
  month: number;
  round: number;
  batteryType: string;
  capacity: number;
  targetQuantity: number;
}

export interface ProcessInfo {
  id: string;
  category: string;
  title: string;
}

export interface WorklogEntry {
  id: number;
  projectId: number;
  processId: string;
  workDate: string;
  round: number;
  quantity: number;
  yield: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorklogPayload {
  processId: string;
  workDate: string;
  shift: string;
  operator: string;
  lotNumber?: string;
  startTime?: string;
  endTime?: string;
  quantity?: number;
  yield?: number;
  remarks?: string;
}
