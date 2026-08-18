import axios from '../axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface Customer {
  id: number;
  name: string;
  shortName: string; // 2자 약어
  note: string;
  createdAt: string;
}

export type CustomerCreateInput = Omit<Customer, 'id' | 'createdAt'>;

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await axios.get(`${API_BASE}/customer`, { withCredentials: true });
  return res.data;
};

export const createCustomer = async (data: CustomerCreateInput): Promise<Customer> => {
  const res = await axios.post(`${API_BASE}/customer`, data, { withCredentials: true });
  return res.data;
};

export const updateCustomer = async (id: number, data: Partial<CustomerCreateInput>): Promise<Customer> => {
  const res = await axios.patch(`${API_BASE}/customer/${id}`, data, { withCredentials: true });
  return res.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/customer/${id}`, { withCredentials: true });
};
