export type DrawingCategory = '공장' | '설비' | '제품' | 'OEM/ODM';

export interface DrawingVersion {
  id: number;
  version: string;
  drawingFileName: string;
  pdfFileName: string | null;
  registrationDate: string;
  changeNote: string | null;
}

export interface Drawing {
  id: number;
  category: DrawingCategory;
  projectName: string;
  drawingNumber: string;
  description: string | null;
  currentVersion: string;
  versions: DrawingVersion[];
}

export interface DrawingListParams {
  category?: DrawingCategory;
  projectName?: string;
  drawingNumber?: string;
}

export interface DrawingCreatePayload {
  category: DrawingCategory;
  projectName: string;
  drawingNumber: string;
  description?: string;
  version: string;
  registrationDate: string;
  changeNote?: string;
  drawingFile: File;
  pdfFile?: File;
}
