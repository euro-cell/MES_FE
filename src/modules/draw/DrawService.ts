import axios from 'axios';
import type { Drawing, DrawingListItem, DrawingListParams, DrawingCreatePayload } from './DrawTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** 도면 목록 조회 */
export const getDrawings = async (params?: DrawingListParams): Promise<DrawingListItem[]> => {
  const response = await axios.get<DrawingListItem[]>(`${API_BASE}/drawing`, { params, withCredentials: true });
  return response.data;
};

/** 도면 상세 조회 */
export const getDrawingById = async (id: number): Promise<Drawing> => {
  const response = await axios.get<Drawing>(`${API_BASE}/drawing/${id}`, { withCredentials: true });
  return response.data;
};

/** 도면 등록 */
export const createDrawing = async (payload: DrawingCreatePayload): Promise<Drawing> => {
  const formData = new FormData();

  formData.append('category', payload.category);
  formData.append('projectName', payload.projectName);
  formData.append('division', payload.division);
  formData.append('drawingNumber', payload.drawingNumber);
  formData.append('version', String(payload.version));
  formData.append('registrationDate', payload.registrationDate);

  if (payload.description) {
    formData.append('description', payload.description);
  }
  if (payload.changeNote) {
    formData.append('changeNote', payload.changeNote);
  }
  if (payload.drawingFile) {
    formData.append('drawingFile', payload.drawingFile);
  }
  if (payload.pdfFiles && payload.pdfFiles.length > 0) {
    payload.pdfFiles.forEach(file => {
      formData.append('pdfFiles', file);
    });
  }

  const response = await axios.post<Drawing>(`${API_BASE}/drawing`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });

  return response.data;
};

/** 버전 추가 */
export interface VersionAddPayload {
  version: number;
  registrationDate: string;
  changeNote?: string;
  drawingFile?: File;
  pdfFiles?: File[];
}

export const addVersion = async (drawingId: number, payload: VersionAddPayload): Promise<Drawing> => {
  const formData = new FormData();
  formData.append('version', String(payload.version));
  formData.append('registrationDate', payload.registrationDate);
  if (payload.changeNote) formData.append('changeNote', payload.changeNote);
  if (payload.drawingFile) formData.append('drawingFile', payload.drawingFile);
  if (payload.pdfFiles) payload.pdfFiles.forEach(f => formData.append('pdfFiles', f));

  const response = await axios.post<Drawing>(`${API_BASE}/drawing/${drawingId}/version`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
  });

  return response.data;
};
