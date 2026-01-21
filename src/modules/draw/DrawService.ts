import axios from 'axios';
import type { Drawing, DrawingListParams, DrawingCreatePayload } from './DrawTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** 도면 목록 조회 */
export const getDrawings = async (params?: DrawingListParams): Promise<Drawing[]> => {
  const res = await axios.get(`${API_BASE}/drawing`, {
    params,
    withCredentials: true,
  });
  return res.data;
};

/** 도면 등록 */
export const createDrawing = async (payload: DrawingCreatePayload): Promise<Drawing> => {
  const formData = new FormData();

  formData.append('category', payload.category);
  formData.append('projectName', payload.projectName);
  formData.append('drawingNumber', payload.drawingNumber);
  formData.append('version', payload.version);
  formData.append('registrationDate', payload.registrationDate);
  formData.append('drawingFile', payload.drawingFile);

  if (payload.description) {
    formData.append('description', payload.description);
  }
  if (payload.changeNote) {
    formData.append('changeNote', payload.changeNote);
  }
  if (payload.pdfFile) {
    formData.append('pdfFile', payload.pdfFile);
  }

  const res = await axios.post(`${API_BASE}/drawing`, formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};
