import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface MaterialCoa {
  id: number;
  materialId: number;
  process: string;
  fileName: string;
  filePath: string;
  createdAt: string;
}

export const getCoAList = async (materialId: number): Promise<MaterialCoa[]> => {
  const response = await axios.get<MaterialCoa[]>(`${API_BASE}/material/coa`, {
    params: { materialId },
    withCredentials: true,
  });
  return response.data;
};

export const uploadCoA = async (materialId: number, process: string, file: File): Promise<MaterialCoa> => {
  const formData = new FormData();
  formData.append('materialId', String(materialId));
  formData.append('process', process);
  formData.append('file', file);

  const response = await axios.post<MaterialCoa>(`${API_BASE}/material/coa`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
  });
  return response.data;
};

export const deleteCoA = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/material/coa/${id}`, {
    withCredentials: true,
  });
};

export const downloadCoA = async (id: number, fileName: string): Promise<void> => {
  const response = await axios.get(`${API_BASE}/material/coa/${id}/download`, {
    responseType: 'blob',
    withCredentials: true,
  });

  const blob = new Blob([response.data], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
