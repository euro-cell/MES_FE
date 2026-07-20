import axios from '../axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface IQCProtoUploadResponse {
  workbookData: Record<string, unknown>;
}

/** IQC 프로토타입: xlsx 업로드 → Univer CLI 변환 → 워크북 JSON(IWorkbookData) 반환 */
export const uploadIQCProtoXlsx = async (file: File): Promise<Record<string, unknown>> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post<IQCProtoUploadResponse>(`${API_BASE}/quality/iqc-proto/upload`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });

  return res.data.workbookData;
};
