import api from './axios';
import type { Travel } from '../types';

export const travelsApi = {
  getAll: () =>
    api.get<Travel[]>('/travels').then(r => r.data),

  getOne: (id: string) =>
    api.get<Travel>(`/travels/${id}`).then(r => r.data),

  create: (data: Partial<Travel>) =>
    api.post<Travel>('/travels', data).then(r => r.data),

  update: (id: string, data: Partial<Travel>) =>
    api.patch<Travel>(`/travels/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/travels/${id}`).then(r => r.data),

  getHistory: () =>
    api.get<{ total: number; travels: Travel[] }>('/travels/history').then(r => r.data),
};