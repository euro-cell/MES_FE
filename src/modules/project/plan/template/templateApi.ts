import type { ProcessTemplate, ProcessTemplateItem } from '../PlanTypes';
import { MOCK_TEMPLATES } from './mockTemplates';

/**
 * 백엔드 API 연동 전까지 사용하는 임시 함수 모음.
 * 시그니처를 실제 API 호출(axios)과 동일하게 맞춰 두면
 * 나중에 내부 구현만 axios.get/post/patch/delete로 교체하면 됨.
 */

let templates: ProcessTemplate[] = MOCK_TEMPLATES.map(t => ({ ...t, items: [...t.items] }));
let nextTemplateId = Math.max(...templates.map(t => t.id)) + 1;
let nextItemId = Math.max(...templates.flatMap(t => t.items.map(i => i.id))) + 1;

const today = () => new Date().toISOString().slice(0, 10);

export const getTemplates = async (): Promise<ProcessTemplate[]> => {
  return templates.map(t => ({ ...t, items: [...t.items] }));
};

export const getTemplate = async (id: number): Promise<ProcessTemplate | undefined> => {
  const found = templates.find(t => t.id === id);
  return found ? { ...found, items: [...found.items] } : undefined;
};

export const createTemplate = async (name: string, formFactor: string): Promise<ProcessTemplate> => {
  const template: ProcessTemplate = { id: nextTemplateId++, name, formFactor, items: [], updatedAt: today() };
  templates = [...templates, template];
  return { ...template, items: [] };
};

export const duplicateTemplate = async (id: number): Promise<ProcessTemplate> => {
  const source = templates.find(t => t.id === id);
  if (!source) throw new Error('템플릿을 찾을 수 없습니다.');
  const copy: ProcessTemplate = {
    id: nextTemplateId++,
    name: `${source.name} (복사본)`,
    formFactor: source.formFactor,
    updatedAt: today(),
    items: source.items.map(item => ({ ...item, id: nextItemId++ })),
  };
  templates = [...templates, copy];
  return { ...copy, items: [...copy.items] };
};

export const saveTemplate = async (
  id: number,
  data: { name: string; formFactor: string; items: Omit<ProcessTemplateItem, 'id'>[] },
): Promise<ProcessTemplate> => {
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) throw new Error('템플릿을 찾을 수 없습니다.');
  const updated: ProcessTemplate = {
    id,
    name: data.name,
    formFactor: data.formFactor,
    updatedAt: today(),
    items: data.items.map((item, i) => ({ ...item, id: templates[index].items[i]?.id ?? nextItemId++, order: i + 1 })),
  };
  templates = templates.map(t => (t.id === id ? updated : t));
  return { ...updated, items: [...updated.items] };
};

export const deleteTemplate = async (id: number): Promise<void> => {
  templates = templates.filter(t => t.id !== id);
};
