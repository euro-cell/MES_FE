export interface PlanProject {
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
  isPlan: boolean;
}

export interface ProcessPlans {
  [key: string]: { start: string; end: string };
}

export interface PlanPayload {
  startDate: string;
  endDate: string;
  weekInfo: string;
  processPlans: ProcessPlans;
}
