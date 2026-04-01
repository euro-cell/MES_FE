import axios from '../axiosInstance';
import type { WorklogProject } from '../../modules/project/worklog/WorklogTypes';
import type { BinderWorklog, BinderWorklogPayload } from '../../modules/project/worklog/processes/01-binder/BinderTypes';
import type { SlurryWorklog, SlurryWorklogPayload } from '../../modules/project/worklog/processes/02-slurry/SlurryTypes';
import type { CoatingWorklog, CoatingWorklogPayload } from '../../modules/project/worklog/processes/03-coating/CoatingTypes';
import type { PressWorklog, PressWorklogPayload } from '../../modules/project/worklog/processes/04-press/PressTypes';
import type { NotchingWorklog, NotchingWorklogPayload } from '../../modules/project/worklog/processes/06-notching/NotchingTypes';
import type { VdWorklog, VdWorklogPayload } from '../../modules/project/worklog/processes/07-vd/VdTypes';
import type { FormingWorklog, FormingWorklogPayload } from '../../modules/project/worklog/processes/08-forming/FormingTypes';
import type { StackingWorklog, StackingWorklogPayload } from '../../modules/project/worklog/processes/09-stacking/StackingTypes';
import type { WeldingWorklog, WeldingWorklogPayload } from '../../modules/project/worklog/processes/10-welding/WeldingTypes';
import type { SealingWorklog, SealingWorklogPayload } from '../../modules/project/worklog/processes/11-sealing/SealingTypes';
import type { FillingWorklog, FillingWorklogPayload } from '../../modules/project/worklog/processes/12-filling/FillingTypes';
import type { FormationWorklog, FormationWorklogPayload } from '../../modules/project/worklog/processes/13-formation/FormationTypes';
import type { GradingWorklog, GradingWorklogPayload } from '../../modules/project/worklog/processes/14-grading/GradingTypes';
import type { InspectionWorklog, InspectionWorklogPayload } from '../../modules/project/worklog/processes/15-inspection/InspectionTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ============ 공통 API ============

/** 전체 프로젝트 조회 */
export const getProjects = async (): Promise<WorklogProject[]> => {
  const res = await axios.get(`${API_BASE}/project`, { withCredentials: true });
  return res.data;
};

/** 특정 프로젝트 조회 */
export const getProject = async (projectId: number): Promise<WorklogProject | null> => {
  const projects = await getProjects();
  return projects.find(p => p.id === projectId) || null;
};

/** 작업일지 목록 조회 (범용) */
export const getWorklogs = async (projectId: number, processId: string): Promise<any[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${processId.toLowerCase()}`, {
    withCredentials: true,
  });
  return res.data;
};

// ============ Binder API ============

export const getBinderTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/binder`, {
    responseType: 'arraybuffer',
    withCredentials: true,
  });
  return res.data;
};

export const getBinderWorklogs = async (projectId: number): Promise<BinderWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/binder`, { withCredentials: true });
  return res.data;
};

export const createBinderWorklog = async (projectId: number, payload: BinderWorklogPayload): Promise<BinderWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/binder`, payload, { withCredentials: true });
  return res.data;
};

export const getBinderWorklog = async (projectId: number, worklogId: number): Promise<BinderWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/binder`, { withCredentials: true });
  return res.data;
};

export const updateBinderWorklog = async (projectId: number, worklogId: number, payload: Partial<BinderWorklogPayload>): Promise<BinderWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/binder`, payload, { withCredentials: true });
  return res.data;
};

export const deleteBinderWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/binder`, { withCredentials: true });
};

/** Binder 작업일지 LOT 목록 조회 (Slurry에서 바인더용액 LOT 드롭다운용) */
export interface BinderLot {
  lotNumber: string;
  solidContent: number;
}

export const getBinderLots = async (projectId: number): Promise<BinderLot[]> => {
  const res = await axios.get<BinderLot[]>(`${API_BASE}/project/${projectId}/worklog/binder/lots`, { withCredentials: true });
  return res.data;
};

// ============ Slurry API ============

export const getSlurryTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/slurry`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getSlurryWorklogs = async (projectId: number): Promise<SlurryWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/slurry`, { withCredentials: true });
  return res.data;
};

export const createSlurryWorklog = async (projectId: number, payload: SlurryWorklogPayload): Promise<SlurryWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/slurry`, payload, { withCredentials: true });
  return res.data;
};

export const getSlurryWorklog = async (projectId: number, worklogId: number): Promise<SlurryWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/slurry`, { withCredentials: true });
  return res.data;
};

export const updateSlurryWorklog = async (projectId: number, worklogId: number, payload: Partial<SlurryWorklogPayload>): Promise<SlurryWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/slurry`, payload, { withCredentials: true });
  return res.data;
};

export const deleteSlurryWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/slurry`, { withCredentials: true });
};

/** Slurry 작업일지 LOT 목록 조회 (Coating에서 슬러리 LOT 드롭다운용) */
export interface SlurryLot {
  lotNumber: string;
  solidContent: number;
  viscosity: number;
}

export const getSlurryLots = async (projectId: number): Promise<SlurryLot[]> => {
  const res = await axios.get<SlurryLot[]>(`${API_BASE}/project/${projectId}/worklog/slurry/lots`, { withCredentials: true });
  return res.data;
};

/** Slurry 믹싱 정보 조회 (Binder에서 투입량 계산용) */
export interface SlurryMixingInfo {
  id: number;
  lot: string;
  workDate: string;
  round: number;
  binderPlannedInput: number;
}

export const getSlurryMixingInfo = async (projectId: number): Promise<SlurryMixingInfo[]> => {
  const res = await axios.get<SlurryMixingInfo[]>(`${API_BASE}/project/${projectId}/worklog/slurry/mixing-info`, { withCredentials: true });
  return res.data;
};

// ============ Coating API ============

export const getCoatingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/coating`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getCoatingWorklogs = async (projectId: number): Promise<CoatingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/coating`, { withCredentials: true });
  return res.data;
};

export const createCoatingWorklog = async (projectId: number, payload: CoatingWorklogPayload): Promise<CoatingWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/coating`, payload, { withCredentials: true });
  return res.data;
};

export const getCoatingWorklog = async (projectId: number, worklogId: number): Promise<CoatingWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/coating`, { withCredentials: true });
  return res.data;
};

export const updateCoatingWorklog = async (projectId: number, worklogId: number, payload: Partial<CoatingWorklogPayload>): Promise<CoatingWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/coating`, payload, { withCredentials: true });
  return res.data;
};

export const deleteCoatingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/coating`, { withCredentials: true });
};

// ============ Press API ============

export const getPressTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/press`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getPressWorklogs = async (projectId: number): Promise<PressWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/press`, { withCredentials: true });
  return res.data;
};

export const createPressWorklog = async (projectId: number, payload: PressWorklogPayload): Promise<PressWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/press`, payload, { withCredentials: true });
  return res.data;
};

export const getPressWorklog = async (projectId: number, worklogId: number): Promise<PressWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/press`, { withCredentials: true });
  return res.data;
};

export const updatePressWorklog = async (projectId: number, worklogId: number, payload: Partial<PressWorklogPayload>): Promise<PressWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/press`, payload, { withCredentials: true });
  return res.data;
};

export const deletePressWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/press`, { withCredentials: true });
};

// ============ Notching API ============

export const getNotchingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/notching`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getNotchingWorklogs = async (projectId: number): Promise<NotchingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/notching`, { withCredentials: true });
  return res.data;
};

export const createNotchingWorklog = async (projectId: number, payload: NotchingWorklogPayload): Promise<NotchingWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/notching`, payload, { withCredentials: true });
  return res.data;
};

export const getNotchingWorklog = async (projectId: number, worklogId: number): Promise<NotchingWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/notching`, { withCredentials: true });
  return res.data;
};

export const updateNotchingWorklog = async (projectId: number, worklogId: number, payload: Partial<NotchingWorklogPayload>): Promise<NotchingWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/notching`, payload, { withCredentials: true });
  return res.data;
};

export const deleteNotchingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/notching`, { withCredentials: true });
};

/** Notching 작업일지 LOT 목록 조회 (VD에서 매거진 LOT 드롭다운용) */
export interface NotchingLotsResponse {
  cathodeLots: string[];
  anodeLots: string[];
}

export const getNotchingLots = async (projectId: number): Promise<NotchingLotsResponse> => {
  const res = await axios.get<NotchingLotsResponse>(`${API_BASE}/project/${projectId}/worklog/notching/lots`, { withCredentials: true });
  return res.data;
};

// ============ VD API ============

export const getVdTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/vd`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getVdWorklogs = async (projectId: number): Promise<VdWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/vd`, { withCredentials: true });
  return res.data;
};

export const createVdWorklog = async (projectId: number, payload: VdWorklogPayload): Promise<VdWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/vd`, payload, { withCredentials: true });
  return res.data;
};

export const getVdWorklog = async (projectId: number, worklogId: number): Promise<VdWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/vd`, { withCredentials: true });
  return res.data;
};

export const updateVdWorklog = async (projectId: number, worklogId: number, payload: Partial<VdWorklogPayload>): Promise<VdWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/vd`, payload, { withCredentials: true });
  return res.data;
};

export const deleteVdWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/vd`, { withCredentials: true });
};

// ============ Forming API ============

export const getFormingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/forming`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getFormingWorklogs = async (projectId: number): Promise<FormingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/forming`, { withCredentials: true });
  return res.data;
};

export const createFormingWorklog = async (projectId: number, payload: FormingWorklogPayload): Promise<FormingWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/forming`, payload, { withCredentials: true });
  return res.data;
};

export const getFormingWorklog = async (projectId: number, worklogId: number): Promise<FormingWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/forming`, { withCredentials: true });
  return res.data;
};

export const updateFormingWorklog = async (projectId: number, worklogId: number, payload: Partial<FormingWorklogPayload>): Promise<FormingWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/forming`, payload, { withCredentials: true });
  return res.data;
};

export const deleteFormingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/forming`, { withCredentials: true });
};

// ============ Stacking API ============

export const getStackingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/stacking`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getStackingWorklogs = async (projectId: number): Promise<StackingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/stacking`, { withCredentials: true });
  return res.data;
};

export const createStackingWorklog = async (projectId: number, payload: StackingWorklogPayload): Promise<StackingWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/stacking`, payload, { withCredentials: true });
  return res.data;
};

export const getStackingWorklog = async (projectId: number, worklogId: number): Promise<StackingWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/stacking`, { withCredentials: true });
  return res.data;
};

export const updateStackingWorklog = async (projectId: number, worklogId: number, payload: Partial<StackingWorklogPayload>): Promise<StackingWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/stacking`, payload, { withCredentials: true });
  return res.data;
};

export const deleteStackingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/stacking`, { withCredentials: true });
};

// ============ Welding API ============

export const getWeldingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/welding`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getWeldingWorklogs = async (projectId: number): Promise<WeldingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/welding`, { withCredentials: true });
  return res.data;
};

export const createWeldingWorklog = async (projectId: number, payload: WeldingWorklogPayload): Promise<WeldingWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/welding`, payload, { withCredentials: true });
  return res.data;
};

export const getWeldingWorklog = async (projectId: number, worklogId: number): Promise<WeldingWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/welding`, { withCredentials: true });
  return res.data;
};

export const updateWeldingWorklog = async (projectId: number, worklogId: number, payload: Partial<WeldingWorklogPayload>): Promise<WeldingWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/welding`, payload, { withCredentials: true });
  return res.data;
};

export const deleteWeldingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/welding`, { withCredentials: true });
};

// ============ Sealing API ============

export const getSealingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/sealing`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getSealingWorklogs = async (projectId: number): Promise<SealingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/sealing`, { withCredentials: true });
  return res.data;
};

export const createSealingWorklog = async (projectId: number, payload: SealingWorklogPayload): Promise<SealingWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/sealing`, payload, { withCredentials: true });
  return res.data;
};

export const getSealingWorklog = async (projectId: number, worklogId: number): Promise<SealingWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/sealing`, { withCredentials: true });
  return res.data;
};

export const updateSealingWorklog = async (projectId: number, worklogId: number, payload: Partial<SealingWorklogPayload>): Promise<SealingWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/sealing`, payload, { withCredentials: true });
  return res.data;
};

export const deleteSealingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/sealing`, { withCredentials: true });
};

// ============ Filling API ============

export const getFillingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/filling`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getFillingWorklogs = async (projectId: number): Promise<FillingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/filling`, { withCredentials: true });
  return res.data;
};

export const createFillingWorklog = async (projectId: number, payload: FillingWorklogPayload): Promise<FillingWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/filling`, payload, { withCredentials: true });
  return res.data;
};

export const getFillingWorklog = async (projectId: number, worklogId: number): Promise<FillingWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/filling`, { withCredentials: true });
  return res.data;
};

export const updateFillingWorklog = async (projectId: number, worklogId: number, payload: Partial<FillingWorklogPayload>): Promise<FillingWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/filling`, payload, { withCredentials: true });
  return res.data;
};

export const deleteFillingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/filling`, { withCredentials: true });
};

// ============ Formation API ============

export const getFormationTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/formation`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getFormationWorklogs = async (projectId: number): Promise<FormationWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/formation`, { withCredentials: true });
  return res.data;
};

export const createFormationWorklog = async (projectId: number, payload: FormationWorklogPayload): Promise<FormationWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/formation`, payload, { withCredentials: true });
  return res.data;
};

export const getFormationWorklog = async (projectId: number, worklogId: number): Promise<FormationWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/formation`, { withCredentials: true });
  return res.data;
};

export const updateFormationWorklog = async (projectId: number, worklogId: number, payload: Partial<FormationWorklogPayload>): Promise<FormationWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/formation`, payload, { withCredentials: true });
  return res.data;
};

export const deleteFormationWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/formation`, { withCredentials: true });
};

// ============ Grading API ============

export const getGradingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/grading`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getGradingWorklogs = async (projectId: number): Promise<GradingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/grading`, { withCredentials: true });
  return res.data;
};

export const createGradingWorklog = async (projectId: number, payload: GradingWorklogPayload): Promise<GradingWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/grading`, payload, { withCredentials: true });
  return res.data;
};

export const getGradingWorklog = async (projectId: number, worklogId: number): Promise<GradingWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/grading`, { withCredentials: true });
  return res.data;
};

export const updateGradingWorklog = async (projectId: number, worklogId: number, payload: Partial<GradingWorklogPayload>): Promise<GradingWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/grading`, payload, { withCredentials: true });
  return res.data;
};

export const deleteGradingWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/grading`, { withCredentials: true });
};

// ============ Inspection API ============

export const getInspectionTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/inspection`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getInspectionWorklogs = async (projectId: number): Promise<InspectionWorklog[]> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/inspection`, { withCredentials: true });
  return res.data;
};

export const createInspectionWorklog = async (projectId: number, payload: InspectionWorklogPayload): Promise<InspectionWorklog> => {
  const res = await axios.post(`${API_BASE}/project/${projectId}/worklog/inspection`, payload, { withCredentials: true });
  return res.data;
};

export const getInspectionWorklog = async (projectId: number, worklogId: number): Promise<InspectionWorklog> => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/worklog/${worklogId}/inspection`, { withCredentials: true });
  return res.data;
};

export const updateInspectionWorklog = async (projectId: number, worklogId: number, payload: Partial<InspectionWorklogPayload>): Promise<InspectionWorklog> => {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/worklog/${worklogId}/inspection`, payload, { withCredentials: true });
  return res.data;
};

export const deleteInspectionWorklog = async (projectId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project/${projectId}/worklog/${worklogId}/inspection`, { withCredentials: true });
};
