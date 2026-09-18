import axios from '../../../../api/axiosInstance';
import type { ProcessTemplate, ProcessTemplateItem } from '../PlanTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getTemplates = async (): Promise<ProcessTemplate[]> => {
  const res = await axios.get(`${API_BASE}/process-templates`);
  return res.data;
};

export const getTemplate = async (id: number): Promise<ProcessTemplate | undefined> => {
  const res = await axios.get(`${API_BASE}/process-templates/${id}`);
  return res.data;
};

export const createTemplate = async (name: string, formFactor: string): Promise<ProcessTemplate> => {
  const res = await axios.post(`${API_BASE}/process-templates`, { name, formFactor, items: [] });
  return res.data;
};

/** 백엔드에 별도 복제 API가 없어 조회 후 이름을 바꿔 새로 생성하는 방식으로 구현 */
export const duplicateTemplate = async (id: number): Promise<ProcessTemplate> => {
  const source = await getTemplate(id);
  if (!source) throw new Error('템플릿을 찾을 수 없습니다.');

  const res = await axios.post(`${API_BASE}/process-templates`, {
    name: `${source.name} (복사본)`,
    formFactor: source.formFactor,
    items: source.items.map(({ group, name, types, order }) => ({ group, name, types, order })),
  });
  return res.data;
};

export const saveTemplate = async (
  id: number,
  data: { name: string; formFactor: string; items: Omit<ProcessTemplateItem, 'id'>[] },
): Promise<ProcessTemplate> => {
  const res = await axios.patch(`${API_BASE}/process-templates/${id}`, data);
  return res.data;
};

export const deleteTemplate = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/process-templates/${id}`);
};
