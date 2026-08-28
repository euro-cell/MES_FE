import axios from '../axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface IQCProto3UploadResponse {
  workbookData: Record<string, unknown>;
  fileName: string;
  license: string;
}

/** IQC 프로토타입3: xlsx 업로드 → Univer CLI로 워크북 JSON 변환 → 신버전 SDK로 브라우저 단독 렌더링 */
export const uploadIQCProto3Xlsx = async (file: File): Promise<IQCProto3UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post<IQCProto3UploadResponse>(`${API_BASE}/quality/iqc-proto3/upload`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });

  return res.data;
};
