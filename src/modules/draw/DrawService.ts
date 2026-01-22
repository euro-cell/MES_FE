import axios from 'axios';
import type { Drawing, DrawingListParams, DrawingCreatePayload } from './DrawTypes';
import mockDrawings from './mockDrawings.json';

const API_BASE = '/drawing';

/** 도면 목록 조회 (목데이터) */
export const getDrawings = async (params?: DrawingListParams): Promise<Drawing[]> => {
  // TODO: API 완성 후 실제 API 호출로 변경
  // const response = await axios.get<Drawing[]>(API_BASE, { params });
  // return response.data;

  await new Promise(resolve => setTimeout(resolve, 300));
  let data = mockDrawings as Drawing[];

  if (params?.category) {
    data = data.filter(d => d.category === params.category);
  }

  return data;
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

  const response = await axios.post<Drawing>(API_BASE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/** 버전 추가 (TODO: API 완성 후 연동) */
export interface VersionAddPayload {
  version: number;
  registrationDate: string;
  changeNote?: string;
  drawingFile?: File;
  pdfFiles?: File[];
}

export const addVersion = async (drawingId: number, payload: VersionAddPayload): Promise<Drawing> => {
  // TODO: API 완성 후 실제 API 호출로 변경
  // const formData = new FormData();
  // formData.append('version', String(payload.version));
  // formData.append('registrationDate', payload.registrationDate);
  // if (payload.changeNote) formData.append('changeNote', payload.changeNote);
  // if (payload.drawingFile) formData.append('drawingFile', payload.drawingFile);
  // if (payload.pdfFiles) payload.pdfFiles.forEach(f => formData.append('pdfFiles', f));
  // const response = await axios.post<Drawing>(`${API_BASE}/${drawingId}/version`, formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // });
  // return response.data;

  await new Promise(resolve => setTimeout(resolve, 500));
  const drawings = mockDrawings as Drawing[];
  const drawing = drawings.find(d => d.id === drawingId);
  if (!drawing) throw new Error('도면을 찾을 수 없습니다.');

  // Mock: 새 버전 추가
  const newVersion = {
    id: Date.now(),
    version: payload.version,
    drawingFileName: payload.drawingFile?.name || null,
    pdfFileNames: payload.pdfFiles?.map(f => f.name) || [],
    registrationDate: payload.registrationDate,
    changeNote: payload.changeNote || null,
  };

  return {
    ...drawing,
    currentVersion: payload.version,
    versions: [...drawing.versions, newVersion],
  };
};
