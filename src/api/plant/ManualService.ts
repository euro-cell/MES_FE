import axios from '../axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface EquipmentManual {
  id: number;
  equipmentId: number;
  fileName: string;
  filePath: string;
  createdAt: string;
}

export const getManualList = async (equipmentId: number): Promise<EquipmentManual[]> => {
  const response = await axios.get<EquipmentManual[]>(`${API_BASE}/equipment/manual`, {
    params: { equipmentId },
    withCredentials: true,
  });
  return response.data;
};

export const uploadManual = async (equipmentId: number, file: File): Promise<EquipmentManual> => {
  const formData = new FormData();
  formData.append('equipmentId', String(equipmentId));
  formData.append('file', file);

  const response = await axios.post<EquipmentManual>(`${API_BASE}/equipment/manual`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
  });
  return response.data;
};

export const deleteManual = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/equipment/manual/${id}`, {
    withCredentials: true,
  });
};

export const viewManual = async (id: number, fileName: string): Promise<void> => {
  const response = await axios.get(`${API_BASE}/equipment/manual/${id}/download`, {
    responseType: 'blob',
    withCredentials: true,
  });

  const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : response.data.type;
  const blob = new Blob([response.data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);
};

export const downloadManual = async (id: number, fileName: string): Promise<void> => {
  const response = await axios.get(`${API_BASE}/equipment/manual/${id}/download`, {
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
