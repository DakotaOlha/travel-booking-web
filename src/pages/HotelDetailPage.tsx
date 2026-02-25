import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { hotelsApi } from '../api/hotels';
import { bookingsApi } from '../api/bookings';
import { travelsApi } from '../api/travels';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import type { Room } from '../types';

const bookingSchema = z.object({
  checkInDate: z.string().min(1),
  checkOutDate: z.string().min(1),
  guestsCount: z.number().min(1),
  travelId: z.string().optional(),
  specialRequests: z.string().optional(),
});
type BookingForm = z.infer<typeof bookingSchema>;

const roomTypeLabels: Record<string, string> = {
  SINGLE: 'Одномісний', DOUBLE: 'Двомісний',
  SUITE: 'Люкс', DELUXE: 'Делюкс', FAMILY: 'Сімейний',
};

export function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: () => hotelsApi.getOne(id!),
  });
  const { data: travels } = useQuery({
    queryKey: ['travels'],
    queryFn: travelsApi.getAll,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { guestsCount: 1 },
  });

  const mutation = useMutation({
    mutationFn: (data: BookingForm) => bookingsApi.create({
      ...data,
      hotelId: id!,
      roomId: selectedRoom!.id,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['booking-report'] });
      setSelectedRoom(null);
      reset();
      navigate('/bookings');
    },
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Завантаження...</div>;
  if (!hotel) return <div className="text-center py-12 text-red-400">Готель не знайдено</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">← Назад</button>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="text-gray-500 mt-1">📍 {hotel.location} · {hotel.address}</p>
            {hotel.description && <p className="text-gray-600 mt-2">{hotel.description}</p>}
          </div>
          {hotel.rating && (
            <div className="text-2xl font-bold text-amber-500">⭐ {hotel.rating}</div>
          )}
        </div>
        {hotel.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {hotel.amenities.map((a) => (
              <span key={a} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{a}</span>
            ))}
          </div>
        )}
      </Card>

      <h2 className="text-xl font-semibold">🛏 Кімнати</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotel.rooms?.map((room) => (
          <Card key={room.id}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">{roomTypeLabels[room.roomType]}</h3>
                <p className="text-sm text-gray-500">👥 До {room.capacity} гостей</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{room.pricePerNight} ₴/ніч</p>
                <Badge color={room.available ? 'green' : 'red'}>
                  {room.available ? 'Вільна' : 'Зайнята'}
                </Badge>
              </div>
            </div>
            {room.description && <p className="text-sm text-gray-600 mb-3">{room.description}</p>}
            <Button
              size="sm"
              disabled={!room.available}
              onClick={() => setSelectedRoom(room)}
            >
              Забронювати
            </Button>
          </Card>
        ))}
      </div>

      {/* Модалка бронювання */}
      <Modal open={!!selectedRoom} onClose={() => setSelectedRoom(null)} title="Нове бронювання">
        {selectedRoom && (
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <strong>{roomTypeLabels[selectedRoom.roomType]}</strong> · {selectedRoom.pricePerNight} ₴/ніч
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Дата заїзду" type="date" error={errors.checkInDate?.message} {...register('checkInDate')} />
              <Input label="Дата виїзду" type="date" error={errors.checkOutDate?.message} {...register('checkOutDate')} />
            </div>
            <Input label="Кількість гостей" type="number" min={1} max={selectedRoom.capacity}
              error={errors.guestsCount?.message} {...register('guestsCount', { valueAsNumber: true })} />
            {travels && travels.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Прив'язати до подорожі (необов'язково)</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" {...register('travelId')}>
                  <option value="">Без подорожі</option>
                  {travels.map((t) => (
                    <option key={t.id} value={t.id}>{t.destination}</option>
                  ))}
                </select>
              </div>
            )}
            <Input label="Особливі побажання" placeholder="Необов'язково..." {...register('specialRequests')} />
            {mutation.isError && (
              <p className="text-red-500 text-sm">Помилка бронювання. Перевірте дані.</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={mutation.isPending} className="flex-1">Підтвердити</Button>
              <Button type="button" variant="ghost" onClick={() => setSelectedRoom(null)}>Скасувати</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}