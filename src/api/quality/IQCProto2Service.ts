import globalAxios from 'axios';
import axios from '../axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface IQCProto2UploadResponse {
  workbookData: Record<string, unknown>;
}

interface IQCProto2GetResponse {
  workbookDataUrl: string | null;
  fileName?: string;
  uploadedAt?: string;
}

/** 프로젝트에 IQC 엑셀을 업로드 → Univer CLI 변환 → 워크북 JSON(IWorkbookData) 반환 (projectId당 최신 1건 유지) */
export const uploadIQCProto2Workbook = async (projectId: number, file: File): Promise<Record<string, unknown>> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post<IQCProto2UploadResponse>(
    `${API_BASE}/quality/iqc-proto2/detail/${projectId}/workbook/upload`,
    formData,
    {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }
  );

  return res.data.workbookData;
};

/** 프로젝트에 등록된 워크북의 RustFS presigned URL 조회 (없으면 workbookDataUrl: null) */
export const getIQCProto2Workbook = async (projectId: number): Promise<IQCProto2GetResponse> => {
  const res = await axios.get<IQCProto2GetResponse>(`${API_BASE}/quality/iqc-proto2/detail/${projectId}/workbook`, {
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
export const exportIQCProto2Xlsx = async (
  projectId: number,
  workbookData: Record<string, unknown>
): Promise<{ blob: Blob; filename: string }> => {
  const res = await axios.post(
    `${API_BASE}/quality/iqc-proto2/detail/${projectId}/workbook/export`,
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

/** 프로젝트에 등록된 워크북 삭제 */
export const deleteIQCProto2Workbook = async (projectId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/quality/iqc-proto2/detail/${projectId}/workbook`, {
    withCredentials: true,
  });
};
