import api from './axios';
import type { Booking, BookingReport } from '../types';

export const bookingsApi = {
  getAll: () =>
    api.get<Booking[]>('/bookings').then(r => r.data),

  getOne: (id: string) =>
    api.get<Booking>(`/bookings/${id}`).then(r => r.data),

  create: (data: {
    checkInDate: string; checkOutDate: string; guestsCount: number;
    hotelId: string; roomId: string; travelId?: string; specialRequests?: string;
  }) => api.post<Booking>('/bookings', data).then(r => r.data),

  update: (id: string, data: Partial<Booking>) =>
    api.patch<Booking>(`/bookings/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/bookings/${id}`).then(r => r.data),

  getReport: () =>
    api.get<BookingReport>('/bookings/report').then(r => r.data),
};