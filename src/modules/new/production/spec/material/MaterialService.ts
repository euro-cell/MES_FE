import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function getMaterialCategories(): Promise<string[]> {
  const res = await axios.get(`${API_BASE}/material/categories`);
  return res.data;
}

export async function getMaterialsByCategory(category: string) {
  const res = await axios.get(`${API_BASE}/material?category=${encodeURIComponent(category)}`);
  return res.data;
}

export async function postMaterialRequirements(productionId: number, payload: any) {
  const res = await axios.post(`${API_BASE}/production/${productionId}/material`, payload);
  return res.data;
}

export const getMaterialsByProduction = async (productionId: number) => {
  const res = await axios.get(`${API_BASE}/production/${productionId}/material`);
  return res.data;
};

export async function updateProductionMaterial(productionId: number, materials: any[]) {
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
    const res = await axios.patch(`${API_BASE}/production/${productionId}/material`, payload);
    return res.data;
  } catch (err: any) {
    console.error('❌ 자재 소요량 수정 실패:', err.response?.data || err.message);
    throw err;
  }
}
