import globalAxios from 'axios';
import axios from '../axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface IQCWorkbookUploadResponse {
  workbookData: Record<string, unknown>;
}

interface IQCWorkbookGetResponse {
  workbookDataUrl: string | null;
  fileName?: string;
  uploadedAt?: string;
}

/** IQC 검사 항목에 원본 xlsx를 업로드 → Univer CLI 변환 → 워크북 JSON(IWorkbookData) 반환 (iqcId당 최신 1건 유지) */
export const uploadIQCWorkbook = async (iqcId: number, file: File): Promise<Record<string, unknown>> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post<IQCWorkbookUploadResponse>(
    `${API_BASE}/quality/iqc/detail/${iqcId}/workbook/upload`,
    formData,
    {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }
  );

  return res.data.workbookData;
};

/** IQC 검사 항목에 첨부된 워크북의 RustFS presigned URL 조회 (없으면 workbookDataUrl: null) */
export const getIQCWorkbook = async (iqcId: number): Promise<IQCWorkbookGetResponse> => {
  const res = await axios.get<IQCWorkbookGetResponse>(`${API_BASE}/quality/iqc/detail/${iqcId}/workbook`, {
    withCredentials: true,
  });

  return res.data;
};

/** RustFS presigned URL에서 워크북 JSON 본문을 직접 가져옴 (쿠키/baseURL 무관한 별도 요청) */
export const fetchWorkbookDataFromUrl = async (url: string): Promise<Record<string, unknown>> => {
  const res = await globalAxios.get<Record<string, unknown>>(url);
  return res.data;
};

/** 워크북 JSON → Univer CLI로 xlsx 변환 → { blob, filename } 반환 */
export const exportIQCWorkbookXlsx = async (
  iqcId: number,
  workbookData: Record<string, unknown>
): Promise<{ blob: Blob; filename: string }> => {
  const res = await axios.post(
    `${API_BASE}/quality/iqc/detail/${iqcId}/workbook/export`,
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

/** IQC 검사 항목에 첨부된 워크북 삭제 */
export const deleteIQCWorkbook = async (iqcId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/quality/iqc/detail/${iqcId}/workbook`, {
    withCredentials: true,
  });
};
