import axios from '../axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface IQCProto2UploadResponse {
  viewerUrl: string;
  fileName: string;
}

/** IQC 프로토타입2: xlsx 업로드 → Univer CLI daemon에 import → 뷰어 URL 반환 (읽기 전용) */
export const uploadIQCProto2Xlsx = async (file: File): Promise<IQCProto2UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post<IQCProto2UploadResponse>(`${API_BASE}/quality/iqc-proto2/upload`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });

  return res.data;
};
