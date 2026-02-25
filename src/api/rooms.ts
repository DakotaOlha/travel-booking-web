import api from './axios';
import type { Room } from '../types';

export const roomsApi = {
  getAll: (hotelId?: string) =>
    api.get<Room[]>('/rooms', { params: hotelId ? { hotelId } : {} }).then(r => r.data),

  getOne: (id: string) =>
    api.get<Room>(`/rooms/${id}`).then(r => r.data),

  create: (data: Partial<Room>) =>
    api.post<Room>('/rooms', data).then(r => r.data),

  update: (id: string, data: Partial<Room>) =>
    api.patch<Room>(`/rooms/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/rooms/${id}`).then(r => r.data),
};