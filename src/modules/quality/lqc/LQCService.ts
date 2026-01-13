import axios from 'axios';
import type { LQCProject } from './LQCTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** LQC 프로젝트 목록 조회 */
export const getLQCProjects = async (): Promise<LQCProject[]> => {
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  return res.data;
};

/** 특정 프로젝트 조회 */
export const getLQCProject = async (projectId: number): Promise<LQCProject | null> => {
  const projects = await getLQCProjects();
  return projects.find(p => p.id === projectId) || null;
};

/** 규격 값 타입 */
export interface SpecValue {
  target?: number;
  tolerance?: number;
  min?: number;
  max?: number;
  unit: string;
}

/** 규격 응답 타입 */
export interface LQCSpec {
  id: number;
  processType: string;
  itemType: string;
  specs: Record<string, SpecValue>;
}

/** LQC 규격 조회 */
export const getLQCSpecs = async (projectId: number, processType?: string, itemType?: string): Promise<LQCSpec[]> => {
  const params = new URLSearchParams();
  if (processType) params.append('processType', processType);
  if (itemType) params.append('itemType', itemType);

  const queryString = params.toString();
  const url = `${API_BASE}/quality/lqc/${projectId}/spec${queryString ? `?${queryString}` : ''}`;

  const res = await axios.get(url, { withCredentials: true });
  return res.data;
};

/** Binder 데이터 응답 타입 */
export interface BinderData {
  id: number;
  manufactureDate: string;
  lot: string;
  viscosity: string;
  solidContent1: string;
  solidContent2: string;
  solidContent3: string;
}

/** Binder 데이터 조회 */
export const getLQCBinderData = async (
  projectId: number,
  electrode: 'A' | 'C'
): Promise<BinderData[]> => {
  const res = await axios.get(`${API_BASE}/quality/lqc/${projectId}/binder?electrode=${electrode}`, {
    withCredentials: true,
  });
  return res.data;
};

/** Slurry 데이터 응답 타입 */
export interface SlurryData {
  id: number;
  manufactureDate: string;
  lot: string;
  viscosityAfterStabilization: string;
  solidContent1Percentage: string;
  solidContent2Percentage: string;
  solidContent3Percentage: string;
  grindGageFineParticle2: number;
}

/** Slurry 데이터 조회 */
export const getLQCSlurryData = async (
  projectId: number,
  electrode: 'A' | 'C'
): Promise<SlurryData[]> => {
  const res = await axios.get(`${API_BASE}/quality/lqc/${projectId}/slurry?electrode=${electrode}`, {
    withCredentials: true,
  });
  return res.data;
};

/** LQC 규격 저장 */
export const saveLQCSpec = async (
  projectId: number,
  processType: string,
  itemType: string,
  specs: Record<string, SpecValue>
): Promise<LQCSpec> => {
  const res = await axios.post(
    `${API_BASE}/quality/lqc/${projectId}/spec`,
    { processType, itemType, specs },
    { withCredentials: true }
  );
  return res.data;
};

/** Coating 데이터 응답 타입 */
export interface CoatingData {
  id: number;
  lot: string;
  division: string; // 구분 (전/후)
  // 단면(A) 면적밀도 (평균은 프론트에서 계산)
  singleSideTop: number | null;
  singleSideMiddle: number | null;
  singleSideBottom: number | null;
  // 양면(A+B) 면적밀도 (평균은 프론트에서 계산)
  doubleSideTop: number | null;
  doubleSideMiddle: number | null;
  doubleSideBottom: number | null;
  // 전극 치수 검사
  coatingWidth: number | null;
  uncoatedArea: number | null;
  mismatch: number | null;
  // 전극 두께 검사 (평균은 프론트에서 계산)
  thicknessTop: number | null;
  thicknessMiddle: number | null;
  thicknessBottom: number | null;
}

/** Coating 데이터 조회 */
export const getLQCCoatingData = async (
  projectId: number,
  electrode: 'A' | 'C'
): Promise<CoatingData[]> => {
  const res = await axios.get(`${API_BASE}/quality/lqc/${projectId}/coating?electrode=${electrode}`, {
    withCredentials: true,
  });
  return res.data;
};

/** Press 데이터 응답 타입 */
export interface PressData {
  id: number;
  lot: string;
  division: string; // 구분 (전/후)
  // 양면(A+B) 면적밀도 (평균은 프론트에서 계산)
  doubleSideTop: number | null;
  doubleSideMiddle: number | null;
  doubleSideBottom: number | null;
  // 전극 치수 검사
  coatingWidth: number | null;
  uncoatedArea: number | null;
  slittingWidth: number | null;
  // 전극 두께 검사 (평균은 프론트에서 계산)
  thicknessTop: number | null;
  thicknessMiddle: number | null;
  thicknessBottom: number | null;
}

/** Press 데이터 조회 */
export const getLQCPressData = async (
  projectId: number,
  electrode: 'A' | 'C'
): Promise<PressData[]> => {
  const res = await axios.get(`${API_BASE}/quality/lqc/${projectId}/press?electrode=${electrode}`, {
    withCredentials: true,
  });
  return res.data;
};

/** VD 데이터 응답 타입 */
export interface VDData {
  id: number;
  workDate: string; // 작업일자
  division: string; // 구분
  // 전극 수분함량 검사 (평균은 프론트에서 계산)
  moisture1: number | null;
  moisture2: number | null;
  moisture3: number | null;
  // 전극 Lot no. (최대 7개)
  lot1: string | null;
  lot2: string | null;
  lot3: string | null;
  lot4: string | null;
  lot5: string | null;
  lot6: string | null;
  lot7: string | null;
}

/** VD 데이터 조회 */
export const getLQCVDData = async (
  projectId: number,
  electrode: 'A' | 'C'
): Promise<VDData[]> => {
  const res = await axios.get(`${API_BASE}/quality/lqc/${projectId}/vd?electrode=${electrode}`, {
    withCredentials: true,
  });
  return res.data;
};
