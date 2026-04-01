import axios from '../axiosInstance';
import type { IQCProject, IQCItem, IQCItemRequest, IQCImage, IQCFile } from '../../modules/quality/iqc/IQCTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** IQC 프로젝트 목록 조회 */
export const getIQCProjects = async (): Promise<IQCProject[]> => {
  const res = await axios.get(`${API_BASE}/project`, { withCredentials: true });
  return res.data;
};

/** 특정 프로젝트 조회 */
export const getIQCProject = async (projectId: number): Promise<IQCProject | null> => {
  const projects = await getIQCProjects();
  return projects.find(p => p.id === projectId) || null;
};

/** IQC 목록 조회 */
export const getIQCList = async (projectId: number): Promise<IQCItem[]> => {
  try {
    const res = await axios.get(`${API_BASE}/quality/iqc/${projectId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error('IQC 목록 조회 실패:', error);
    return [];
  }
};

/** IQC 단건 조회 */
export const getIQCDetail = async (id: number): Promise<IQCItem | null> => {
  try {
    const res = await axios.get(`${API_BASE}/quality/iqc/detail/${id}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error('IQC 단건 조회 실패:', error);
    return null;
  }
};

/** IQC 생성 */
export const createIQC = async (
  projectId: number,
  data: IQCItemRequest
): Promise<IQCItem> => {
  const res = await axios.post(`${API_BASE}/quality/iqc/${projectId}`, data, {
    withCredentials: true,
  });
  return res.data;
};

/** IQC 수정 */
export const updateIQC = async (
  id: number,
  data: Partial<IQCItemRequest>
): Promise<IQCItem> => {
  const res = await axios.put(`${API_BASE}/quality/iqc/detail/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

/** IQC 삭제 */
export const deleteIQC = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/quality/iqc/detail/${id}`, {
    withCredentials: true,
  });
};

/** IQC 이미지 업로드 */
export const uploadIQCImages = async (
  iqcId: number,
  imageType: string,
  files: File[],
  imageLabel?: string
): Promise<IQCImage[]> => {
  const formData = new FormData();
  formData.append('imageType', imageType);
  if (imageLabel !== undefined) formData.append('imageLabel', imageLabel);
  files.forEach((file) => formData.append('files', file));

  const res = await axios.post(
    `${API_BASE}/quality/iqc/detail/${iqcId}/images`,
    formData,
    { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
};

/** IQC 이미지 레이블 수정 */
export const updateIQCImageLabel = async (imageId: number, imageLabel: string): Promise<void> => {
  await axios.patch(
    `${API_BASE}/quality/iqc/images/${imageId}/label`,
    { imageLabel },
    { withCredentials: true }
  );
};

/** IQC 이미지 삭제 */
export const deleteIQCImage = async (imageId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/quality/iqc/images/${imageId}`, {
    withCredentials: true,
  });
};

/** IQC 파일 업로드 (PDF 등) */
export const uploadIQCFile = async (
  iqcId: number,
  fileType: string,
  file: File
): Promise<IQCFile> => {
  const formData = new FormData();
  formData.append('fileType', fileType);
  formData.append('file', file);

  const res = await axios.post(
    `${API_BASE}/quality/iqc/detail/${iqcId}/files`,
    formData,
    { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
};

/** IQC 파일 삭제 */
export const deleteIQCFile = async (fileId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/quality/iqc/files/${fileId}`, {
    withCredentials: true,
  });
};
