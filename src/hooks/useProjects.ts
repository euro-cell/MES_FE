import { useQuery } from '@tanstack/react-query';
import axios from '../api/axiosInstance';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const fetchProjects = async () => {
  const res = await axios.get(`${API_BASE}/project`, { withCredentials: true });
  return res.data;
};

export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 10 * 60 * 1000, // 10분
  });
