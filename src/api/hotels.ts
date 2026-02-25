import api from './axios';
import type { Hotel, PaginatedResponse } from '../types';

export const hotelsApi = {
  getAll: (params?: { location?: string; name?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Hotel>>('/hotels', { params }).then(r => r.data),

  getOne: (id: string) =>
    api.get<Hotel>(`/hotels/${id}`).then(r => r.data),

  create: (data: Partial<Hotel>) =>
    api.post<Hotel>('/hotels', data).then(r => r.data),

  update: (id: string, data: Partial<Hotel>) =>
    api.patch<Hotel>(`/hotels/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/hotels/${id}`).then(r => r.data),
};