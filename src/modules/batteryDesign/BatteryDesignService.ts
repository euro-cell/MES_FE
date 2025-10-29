import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const batteryDesignService = {
  async saveDesign(productionId: number, data: any) {
    try {
      const res = await axios.post(`${API_BASE}/specification/${productionId}`, data, {
        withCredentials: true,
      });
      console.log('🚀 ~ res:', res);
      return res.data;
    } catch (err) {
      console.error('❌ 전지 설계 저장 실패:', err);
      throw err;
    }
  },

  /** 🔹 전체 설계 리스트 조회 */
  async getAll() {
    return axios.get(`${API_BASE}/battery-design`, { withCredentials: true });
  },

  /** 🔹 설계 등록 */
  async create(data: any) {
    return axios.post(`${API_BASE}/battery-design`, data, { withCredentials: true });
  },

  /** 🔹 설계 상세 조회 */
  async getById(id: number) {
    return axios.get(`${API_BASE}/battery-design/${id}`, { withCredentials: true });
  },

  /** 🔹 설계 수정 */
  async update(id: number, data: any) {
    return axios.put(`${API_BASE}/battery-design/${id}`, data, { withCredentials: true });
  },

  /** 🔹 설계 삭제 */
  async remove(id: number) {
    return axios.delete(`${API_BASE}/battery-design/${id}`, { withCredentials: true });
  },
};
