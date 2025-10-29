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

  async fetchProjects() {
    try {
      const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
      return res.data;
    } catch (err) {
      console.error('❌ 프로젝트 목록 불러오기 실패:', err);
      throw err;
    }
  },

  async deleteDesign(productionId: number) {
    try {
      const res = await axios.delete(`${API_BASE}/specification/${productionId}`, {
        withCredentials: true,
      });
      console.log('🗑️ 전지 설계 삭제 완료:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ 전지 설계 삭제 실패:', err);
      throw err;
    }
  },
};
