const API_BASE = import.meta.env.VITE_API_BASE_URL;

import axios from '../axiosInstance';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await axios.patch(`${API_BASE}/auth/me/password`, data, { withCredentials: true });
}
