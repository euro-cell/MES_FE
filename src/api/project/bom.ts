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
