import axios from '../axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface BomTemplateRow {
  classification: string;
  materialId: number | null;
  yieldRate: number | null;
  currency: string;
  purchasePrice: number | null;
  tariff: number | null;
  etc: number | null;
  netQty: number | null;
}

export interface CreateBomTemplatePayload {
  name: string;
  description?: string;
  usdRate: number | null;
  jpyRate: number | null;
  eurRate: number | null;
  rows: BomTemplateRow[];
}

export interface BomTemplateSummary {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface BomTemplateDetail {
  id: number;
  name: string;
  description: string | null;
  usdRate: number | null;
  jpyRate: number | null;
  eurRate: number | null;
  rows: {
    id: number;
    classification: string;
    materialId: number | null;
    category: string | null;
    materialType: string | null;
    product: string | null;
    manufacturer: string | null;
    unit: string | null;
    yieldRate: number | null;
    currency: string;
    purchasePrice: number | null;
    tariff: number | null;
    etc: number | null;
    netQty: number;
  }[];
}

/** BOM 템플릿 생성 */
export async function createBomTemplate(payload: CreateBomTemplatePayload): Promise<{ id: number; name: string }> {
  const res = await axios.post(`${API_BASE}/project/bom/templates`, payload, { withCredentials: true });
  return res.data;
}

/** BOM 템플릿 목록 조회 */
export async function getBomTemplates(): Promise<BomTemplateSummary[]> {
  const res = await axios.get(`${API_BASE}/project/bom/templates`, { withCredentials: true });
  return res.data;
}

/** BOM 템플릿 단건 조회 */
export async function getBomTemplate(id: number): Promise<BomTemplateDetail> {
  const res = await axios.get(`${API_BASE}/project/bom/templates/${id}`, { withCredentials: true });
  return res.data;
}

/** BOM 템플릿 수정 (헤더 + rows 전체 교체) */
export async function updateBomTemplate(id: number, payload: CreateBomTemplatePayload): Promise<BomTemplateDetail> {
  const res = await axios.patch(`${API_BASE}/project/bom/templates/${id}`, payload, { withCredentials: true });
  return res.data;
}

/** 프로젝트에 BOM 템플릿 연결 */
export async function linkBomTemplate(projectId: number, templateId: number): Promise<{ projectId: number; templateId: number }> {
  const res = await axios.post(`${API_BASE}/project/bom/${projectId}/link`, { templateId }, { withCredentials: true });
  return res.data;
}

/** 프로젝트별 연결된 BOM 조회 */
export async function getProjectBom(projectId: number): Promise<BomTemplateDetail> {
  const res = await axios.get(`${API_BASE}/project/bom/${projectId}`, { withCredentials: true });
  return res.data;
}

/** 프로젝트-BOM 연결 해제 */
export async function unlinkBomTemplate(projectId: number): Promise<void> {
  await axios.delete(`${API_BASE}/project/bom/${projectId}/link`, { withCredentials: true });
}

/** BOM 템플릿 완전 삭제 */
export async function deleteBomTemplate(templateId: number): Promise<void> {
  await axios.delete(`${API_BASE}/project/bom/templates/${templateId}`, { withCredentials: true });
}
