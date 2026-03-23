import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ============ 규격 (Specification) API ============

/** 규격 요약 조회 */
export const getSpecificationSummary = async () => {
  const res = await axios.get(`${API_BASE}/project/specification`, { withCredentials: true });
  return res.data;
};

/** 규격 생성 */
export async function createSpecification(projectId: number, specData: any) {
  const res = await axios.post(`${API_BASE}/project/${projectId}/specification`, specData, {
    withCredentials: true,
  });
  return res.data;
}

/** 프로젝트별 규격 조회 */
export async function getSpecificationByProject(projectId: number) {
  const res = await axios.get(`${API_BASE}/project/${projectId}/specification`);
  return res.data;
}

/** 규격 수정 */
export async function updateSpecification(projectId: number, form: any) {
  const res = await axios.patch(`${API_BASE}/project/${projectId}/specification`, form);
  return res.data;
}

/** 규격 삭제 */
export async function deleteSpecification(projectId: number) {
  const res = await axios.delete(`${API_BASE}/project/${projectId}/specification`);
  return res.data;
}

// ============ 자재 소요량 (Material) API ============
// 참고: 기본 자재 카테고리 API는 src/api/material.ts에 있음

/** 자재 소요량 등록 */
export async function postMaterialRequirements(projectId: number, payload: any) {
  const res = await axios.post(`${API_BASE}/project/${projectId}/material`, payload);
  return res.data;
}

/** 프로젝트별 자재 조회 */
export const getMaterialsByProject = async (projectId: number) => {
  const res = await axios.get(`${API_BASE}/project/${projectId}/material`);
  return res.data;
};

/** 자재 소요량 수정 */
export async function updateProjectMaterial(projectId: number, materials: any[]) {
  try {
    const payload = {
      materials: materials.map(m => ({
        classification: m.classification,
        category: m.category,
        type: m.material ?? m.type,
        name: m.model ?? m.name,
        company: m.company,
        unit: m.unit,
        quantity: Number(m.quantity ?? m.requiredAmount) || 0,
      })),
    };
    const res = await axios.patch(`${API_BASE}/project/${projectId}/material`, payload);
    return res.data;
  } catch (err: any) {
    console.error('❌ 자재 소요량 수정 실패:', err.response?.data || err.message);
    throw err;
  }
}

/** 자재 소요량 삭제 */
export async function deleteProjectMaterial(projectId: number) {
  try {
    const res = await axios.delete(`${API_BASE}/project/${projectId}/material`);
    return res.data;
  } catch (err: any) {
    console.error('❌ 자재 소요량 삭제 실패:', err.response?.data || err.message);
    throw err;
  }
}
