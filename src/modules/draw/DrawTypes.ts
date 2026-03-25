export type DrawingCategory = '공장' | '설비' | '제품' | 'OEM/ODM';

export interface DrawingVersion {
  id: number;
  version: number;
  drawingFileName: string | null;
  drawingFilePath: string | null;
  drawingFileUrl: string | null;
  pdfFileNames: string[];
  pdfFilePaths: string[];
  pdfFileUrls: string[];
  imageFilePaths: string[];
  imageFileUrls: string[];
  registrationDate: string;
  changeNote: string | null;
}

/** 목록 조회용 (versions 없음) */
export interface DrawingListItem {
  id: number;
  category: DrawingCategory;
  projectName: string;
  division: string;
  drawingNumber: string;
  description: string | null;
  currentVersion: number;
  latestRegistrationDate: string;
}

/** 상세 조회용 (versions 포함) */
export interface Drawing {
  id: number;
  category: DrawingCategory;
  projectName: string;
  division: string;
  drawingNumber: string;
  description: string | null;
  currentVersion: number;
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
  division: string;
  drawingNumber: string;
  description?: string;
  version: number;
  registrationDate: string;
  changeNote?: string;
  drawingFile?: File;
  pdfFiles?: File[];
}

export interface DrawingUpdatePayload {
  category?: DrawingCategory;
  projectName?: string;
  division?: string;
  drawingNumber?: string;
  description?: string;
}

export interface VersionUpdatePayload {
  changeNote?: string;
  drawingFile?: File;
  pdfFiles?: File[];
}
