export type DrawingCategory = '공장' | '설비' | '제품' | 'OEM/ODM';

export interface DrawingLedgerItem {
  id: number;
  category: DrawingCategory;
  registeredDate: string;
  projectName: string;
  drawingNo: string;
  version: string;
  description: string;
}
