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
  templateId?: number;
}

export interface ProcessTemplateItem {
  id: number;
  group: string;
  name: string;
  types: string[];
  order: number;
}

export interface ProcessTemplate {
  id: number;
  name: string;
  formFactor: string;
  items: ProcessTemplateItem[];
  createdAt?: string;
  updatedAt: string;
}
