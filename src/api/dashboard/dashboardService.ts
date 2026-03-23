import axios from 'axios';
import type { DashboardProject, DashboardProjectPlan, ProductionProgressResponse, DashboardSummaryItem } from '../../modules/dashboard/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getAllProjects = async (): Promise<DashboardProject[]> => {
  const res = await axios.get(`${API_BASE}/project`, { withCredentials: true });
  return res.data;
};

export const getProjectPlan = async (id: number): Promise<DashboardProjectPlan | null> => {
  try {
    const res = await axios.get(`${API_BASE}/project/${id}/plan`, { withCredentials: true });
    const plans = res.data;
    if (Array.isArray(plans) && plans.length > 0) return plans[plans.length - 1];
    return null;
  } catch {
    return null;
  }
};

export const createProject = async (form: any) => {
  const res = await axios.post(`${API_BASE}/project`, form, { withCredentials: true });
  return res.data;
};

export const updateProject = async (id: number, form: any) => {
  const res = await axios.patch(`${API_BASE}/project/${id}`, form, { withCredentials: true });
  return res.data;
};

export const deleteProject = async (id: number) => {
  const res = await axios.delete(`${API_BASE}/project/${id}`, { withCredentials: true });
  return res.data;
};

export const getProjectProgress = async (id: number): Promise<ProductionProgressResponse> => {
  const res = await axios.get(`${API_BASE}/project/${id}/status/progress`, { withCredentials: true });
  return res.data;
};

export const getDashboardSummary = async (): Promise<DashboardSummaryItem[]> => {
  const res = await axios.get(`${API_BASE}/dashboard/summary`, { withCredentials: true });
  return res.data;
};
