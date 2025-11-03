import axios from 'axios';
import type { DashboardProject, DashboardProjectPlan } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getAllProductions = async (): Promise<DashboardProject[]> => {
  const res = await axios.get(`${API_BASE}/production`, { withCredentials: true });
  return res.data;
};

export const getProductionPlan = async (id: number): Promise<DashboardProjectPlan | null> => {
  try {
    const res = await axios.get(`${API_BASE}/production/${id}/plan`, { withCredentials: true });
    const plans = res.data;
    if (Array.isArray(plans) && plans.length > 0) return plans[plans.length - 1];
    return null;
  } catch {
    return null;
  }
};

export const createProduction = async (form: any) => {
  const res = await axios.post(`${API_BASE}/production`, form, { withCredentials: true });
  return res.data;
};

export const updateProduction = async (id: number, form: any) => {
  const res = await axios.patch(`${API_BASE}/production/${id}`, form, { withCredentials: true });
  return res.data;
};

export const deleteProduction = async (id: number) => {
  const res = await axios.delete(`${API_BASE}/production/${id}`, { withCredentials: true });
  return res.data;
};
