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

/** IQC 프로토타입: 워크북 JSON → Univer CLI로 xlsx 변환 → { blob, filename } 반환 */
export const exportIQCProtoXlsx = async (
  workbookData: Record<string, unknown>
): Promise<{ blob: Blob; filename: string }> => {
  const res = await axios.post(
    `${API_BASE}/quality/iqc-proto/export`,
    { workbookData },
    {
      withCredentials: true,
      responseType: 'blob',
      timeout: 120000,
    }
  );

  const disposition = res.headers['content-disposition'] as string | undefined;
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? 'export.xlsx';

  return { blob: res.data as Blob, filename };
};
