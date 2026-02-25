import api from './axios';
import type { AuthResponse, User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),

  register: (data: {
    email: string; password: string;
    firstName: string; lastName: string; phone?: string;
  }) => api.post<{ message: string; user: User }>('/auth/register', data).then(r => r.data),
};