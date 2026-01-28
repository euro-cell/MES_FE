import axios from 'axios';
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
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  return res.data;
};

/** 특정 프로젝트 조회 */
export const getProject = async (projectId: number): Promise<WorklogProject | null> => {
  const projects = await getProjects();
  return projects.find(p => p.id === projectId) || null;
};

/** 작업일지 목록 조회 (범용) */
export const getWorklogs = async (projectId: number, processId: string): Promise<any[]> => {
  const res = await axios.get(`${API_BASE}/production/${projectId}/worklog/${processId.toLowerCase()}`, {
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

export const getBinderWorklogs = async (productionId: number): Promise<BinderWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/binder`, { withCredentials: true });
  return res.data;
};

export const createBinderWorklog = async (productionId: number, payload: BinderWorklogPayload): Promise<BinderWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/binder`, payload, { withCredentials: true });
  return res.data;
};

export const getBinderWorklog = async (productionId: number, worklogId: number): Promise<BinderWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/binder`, { withCredentials: true });
  return res.data;
};

export const updateBinderWorklog = async (productionId: number, worklogId: number, payload: Partial<BinderWorklogPayload>): Promise<BinderWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/binder`, payload, { withCredentials: true });
  return res.data;
};

export const deleteBinderWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/binder`, { withCredentials: true });
};

// ============ Slurry API ============

export const getSlurryTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/slurry`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getSlurryWorklogs = async (productionId: number): Promise<SlurryWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/slurry`, { withCredentials: true });
  return res.data;
};

export const createSlurryWorklog = async (productionId: number, payload: SlurryWorklogPayload): Promise<SlurryWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/slurry`, payload, { withCredentials: true });
  return res.data;
};

export const getSlurryWorklog = async (productionId: number, worklogId: number): Promise<SlurryWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/slurry`, { withCredentials: true });
  return res.data;
};

export const updateSlurryWorklog = async (productionId: number, worklogId: number, payload: Partial<SlurryWorklogPayload>): Promise<SlurryWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/slurry`, payload, { withCredentials: true });
  return res.data;
};

export const deleteSlurryWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/slurry`, { withCredentials: true });
};

// ============ Coating API ============

export const getCoatingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/coating`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getCoatingWorklogs = async (productionId: number): Promise<CoatingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/coating`, { withCredentials: true });
  return res.data;
};

export const createCoatingWorklog = async (productionId: number, payload: CoatingWorklogPayload): Promise<CoatingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/coating`, payload, { withCredentials: true });
  return res.data;
};

export const getCoatingWorklog = async (productionId: number, worklogId: number): Promise<CoatingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/coating`, { withCredentials: true });
  return res.data;
};

export const updateCoatingWorklog = async (productionId: number, worklogId: number, payload: Partial<CoatingWorklogPayload>): Promise<CoatingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/coating`, payload, { withCredentials: true });
  return res.data;
};

export const deleteCoatingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/coating`, { withCredentials: true });
};

// ============ Press API ============

export const getPressTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/press`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getPressWorklogs = async (productionId: number): Promise<PressWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/press`, { withCredentials: true });
  return res.data;
};

export const createPressWorklog = async (productionId: number, payload: PressWorklogPayload): Promise<PressWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/press`, payload, { withCredentials: true });
  return res.data;
};

export const getPressWorklog = async (productionId: number, worklogId: number): Promise<PressWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/press`, { withCredentials: true });
  return res.data;
};

export const updatePressWorklog = async (productionId: number, worklogId: number, payload: Partial<PressWorklogPayload>): Promise<PressWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/press`, payload, { withCredentials: true });
  return res.data;
};

export const deletePressWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/press`, { withCredentials: true });
};

// ============ Notching API ============

export const getNotchingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/notching`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getNotchingWorklogs = async (productionId: number): Promise<NotchingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/notching`, { withCredentials: true });
  return res.data;
};

export const createNotchingWorklog = async (productionId: number, payload: NotchingWorklogPayload): Promise<NotchingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/notching`, payload, { withCredentials: true });
  return res.data;
};

export const getNotchingWorklog = async (productionId: number, worklogId: number): Promise<NotchingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/notching`, { withCredentials: true });
  return res.data;
};

export const updateNotchingWorklog = async (productionId: number, worklogId: number, payload: Partial<NotchingWorklogPayload>): Promise<NotchingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/notching`, payload, { withCredentials: true });
  return res.data;
};

export const deleteNotchingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/notching`, { withCredentials: true });
};

// ============ VD API ============

export const getVdTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/vd`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getVdWorklogs = async (productionId: number): Promise<VdWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/vd`, { withCredentials: true });
  return res.data;
};

export const createVdWorklog = async (productionId: number, payload: VdWorklogPayload): Promise<VdWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/vd`, payload, { withCredentials: true });
  return res.data;
};

export const getVdWorklog = async (productionId: number, worklogId: number): Promise<VdWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/vd`, { withCredentials: true });
  return res.data;
};

export const updateVdWorklog = async (productionId: number, worklogId: number, payload: Partial<VdWorklogPayload>): Promise<VdWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/vd`, payload, { withCredentials: true });
  return res.data;
};

export const deleteVdWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/vd`, { withCredentials: true });
};

// ============ Forming API ============

export const getFormingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/forming`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getFormingWorklogs = async (productionId: number): Promise<FormingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/forming`, { withCredentials: true });
  return res.data;
};

export const createFormingWorklog = async (productionId: number, payload: FormingWorklogPayload): Promise<FormingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/forming`, payload, { withCredentials: true });
  return res.data;
};

export const getFormingWorklog = async (productionId: number, worklogId: number): Promise<FormingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/forming`, { withCredentials: true });
  return res.data;
};

export const updateFormingWorklog = async (productionId: number, worklogId: number, payload: Partial<FormingWorklogPayload>): Promise<FormingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/forming`, payload, { withCredentials: true });
  return res.data;
};

export const deleteFormingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/forming`, { withCredentials: true });
};

// ============ Stacking API ============

export const getStackingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/stacking`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getStackingWorklogs = async (productionId: number): Promise<StackingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/stacking`, { withCredentials: true });
  return res.data;
};

export const createStackingWorklog = async (productionId: number, payload: StackingWorklogPayload): Promise<StackingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/stacking`, payload, { withCredentials: true });
  return res.data;
};

export const getStackingWorklog = async (productionId: number, worklogId: number): Promise<StackingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/stacking`, { withCredentials: true });
  return res.data;
};

export const updateStackingWorklog = async (productionId: number, worklogId: number, payload: Partial<StackingWorklogPayload>): Promise<StackingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/stacking`, payload, { withCredentials: true });
  return res.data;
};

export const deleteStackingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/stacking`, { withCredentials: true });
};

// ============ Welding API ============

export const getWeldingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/welding`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getWeldingWorklogs = async (productionId: number): Promise<WeldingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/welding`, { withCredentials: true });
  return res.data;
};

export const createWeldingWorklog = async (productionId: number, payload: WeldingWorklogPayload): Promise<WeldingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/welding`, payload, { withCredentials: true });
  return res.data;
};

export const getWeldingWorklog = async (productionId: number, worklogId: number): Promise<WeldingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/welding`, { withCredentials: true });
  return res.data;
};

export const updateWeldingWorklog = async (productionId: number, worklogId: number, payload: Partial<WeldingWorklogPayload>): Promise<WeldingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/welding`, payload, { withCredentials: true });
  return res.data;
};

export const deleteWeldingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/welding`, { withCredentials: true });
};

// ============ Sealing API ============

export const getSealingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/sealing`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getSealingWorklogs = async (productionId: number): Promise<SealingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/sealing`, { withCredentials: true });
  return res.data;
};

export const createSealingWorklog = async (productionId: number, payload: SealingWorklogPayload): Promise<SealingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/sealing`, payload, { withCredentials: true });
  return res.data;
};

export const getSealingWorklog = async (productionId: number, worklogId: number): Promise<SealingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/sealing`, { withCredentials: true });
  return res.data;
};

export const updateSealingWorklog = async (productionId: number, worklogId: number, payload: Partial<SealingWorklogPayload>): Promise<SealingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/sealing`, payload, { withCredentials: true });
  return res.data;
};

export const deleteSealingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/sealing`, { withCredentials: true });
};

// ============ Filling API ============

export const getFillingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/filling`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getFillingWorklogs = async (productionId: number): Promise<FillingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/filling`, { withCredentials: true });
  return res.data;
};

export const createFillingWorklog = async (productionId: number, payload: FillingWorklogPayload): Promise<FillingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/filling`, payload, { withCredentials: true });
  return res.data;
};

export const getFillingWorklog = async (productionId: number, worklogId: number): Promise<FillingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/filling`, { withCredentials: true });
  return res.data;
};

export const updateFillingWorklog = async (productionId: number, worklogId: number, payload: Partial<FillingWorklogPayload>): Promise<FillingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/filling`, payload, { withCredentials: true });
  return res.data;
};

export const deleteFillingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/filling`, { withCredentials: true });
};

// ============ Formation API ============

export const getFormationTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/formation`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getFormationWorklogs = async (productionId: number): Promise<FormationWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/formation`, { withCredentials: true });
  return res.data;
};

export const createFormationWorklog = async (productionId: number, payload: FormationWorklogPayload): Promise<FormationWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/formation`, payload, { withCredentials: true });
  return res.data;
};

export const getFormationWorklog = async (productionId: number, worklogId: number): Promise<FormationWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/formation`, { withCredentials: true });
  return res.data;
};

export const updateFormationWorklog = async (productionId: number, worklogId: number, payload: Partial<FormationWorklogPayload>): Promise<FormationWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/formation`, payload, { withCredentials: true });
  return res.data;
};

export const deleteFormationWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/formation`, { withCredentials: true });
};

// ============ Grading API ============

export const getGradingTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/grading`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getGradingWorklogs = async (productionId: number): Promise<GradingWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/grading`, { withCredentials: true });
  return res.data;
};

export const createGradingWorklog = async (productionId: number, payload: GradingWorklogPayload): Promise<GradingWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/grading`, payload, { withCredentials: true });
  return res.data;
};

export const getGradingWorklog = async (productionId: number, worklogId: number): Promise<GradingWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/grading`, { withCredentials: true });
  return res.data;
};

export const updateGradingWorklog = async (productionId: number, worklogId: number, payload: Partial<GradingWorklogPayload>): Promise<GradingWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/grading`, payload, { withCredentials: true });
  return res.data;
};

export const deleteGradingWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/grading`, { withCredentials: true });
};

// ============ Inspection API ============

export const getInspectionTemplate = async (): Promise<ArrayBuffer> => {
  const res = await axios.get(`${API_BASE}/worklog/inspection`, { responseType: 'arraybuffer', withCredentials: true });
  return res.data;
};

export const getInspectionWorklogs = async (productionId: number): Promise<InspectionWorklog[]> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/inspection`, { withCredentials: true });
  return res.data;
};

export const createInspectionWorklog = async (productionId: number, payload: InspectionWorklogPayload): Promise<InspectionWorklog> => {
  const res = await axios.post(`${API_BASE}/production/${productionId}/worklog/inspection`, payload, { withCredentials: true });
  return res.data;
};

export const getInspectionWorklog = async (productionId: number, worklogId: number): Promise<InspectionWorklog> => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/worklog/${worklogId}/inspection`, { withCredentials: true });
  return res.data;
};

export const updateInspectionWorklog = async (productionId: number, worklogId: number, payload: Partial<InspectionWorklogPayload>): Promise<InspectionWorklog> => {
  const res = await axios.patch(`${API_BASE}/production/${productionId}/worklog/${worklogId}/inspection`, payload, { withCredentials: true });
  return res.data;
};

export const deleteInspectionWorklog = async (productionId: number, worklogId: number): Promise<void> => {
  await axios.delete(`${API_BASE}/production/${productionId}/worklog/${worklogId}/inspection`, { withCredentials: true });
};
