import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { hotelsApi } from '../api/hotels';
import { bookingsApi } from '../api/bookings';
import { travelsApi } from '../api/travels';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import type { Room } from '../types';

const bookingSchema = z.object({
  checkInDate: z.string().min(1, 'Вкажіть дату заїзду'),
  checkOutDate: z.string().min(1, 'Вкажіть дату виїзду'),
  guestsCount: z.number({ invalid_type_error: 'Вкажіть кількість' }).min(1),
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

  const bookingMutation = useMutation({
    mutationFn: (data: BookingForm) => bookingsApi.create({
      ...data,
      checkInDate: new Date(data.checkInDate).toISOString(),
      checkOutDate: new Date(data.checkOutDate).toISOString(),
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

  const handleCloseModal = () => {
    setSelectedRoom(null);
    reset();
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!hotel) return <div className="text-center py-16 text-slate-400">Готель не знайдено</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
        ← Назад до готелів
      </button>

      {/* Hotel header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-sky-500 to-sky-400 px-8 py-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{hotel.name}</h1>
              <p className="text-sky-100 mt-1 text-sm">{hotel.location} · {hotel.address}</p>
              {hotel.description && <p className="text-sky-50 mt-3 text-sm max-w-lg">{hotel.description}</p>}
            </div>
            {hotel.rating && (
              <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold">{hotel.rating}</p>
                <p className="text-xs text-sky-100">рейтинг</p>
              </div>
            )}
          </div>
        </div>
        {hotel.amenities?.length > 0 && (
          <div className="px-8 py-4 flex flex-wrap gap-2">
            {hotel.amenities.map((a) => (
              <span key={a} className="text-sm bg-sky-50 text-sky-600 border border-sky-100 px-3 py-1 rounded-full">{a}</span>
            ))}
          </div>
        )}
      </div>

      {/* Rooms */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Доступні кімнати</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotel.rooms?.map((room) => (
            <div key={room.id}
              className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${room.available ? 'border-slate-100 hover:border-sky-200 hover:shadow-md' : 'border-slate-100 opacity-60'
                }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{roomTypeLabels[room.roomType]}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">до {room.capacity} гостей</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sky-600 text-lg">{room.pricePerNight.toLocaleString('uk')} ₴</p>
                  <p className="text-xs text-slate-400">за ніч</p>
                </div>
              </div>
              {room.description && (
                <p className="text-sm text-slate-500 mb-4">{room.description}</p>
              )}
              <div className="flex items-center justify-between">
                <Badge color={room.available ? 'green' : 'red'}>
                  {room.available ? 'Вільна' : 'Зайнята'}
                </Badge>
                <Button
                  size="sm"
                  disabled={!room.available}
                  onClick={() => setSelectedRoom(room)}
                >
                  Забронювати
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking modal */}
      <Modal open={!!selectedRoom} onClose={handleCloseModal} title="Нове бронювання">
        {selectedRoom && (
          <form onSubmit={handleSubmit((data) => bookingMutation.mutate(data))} className="space-y-4">
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
              <p className="font-semibold text-sky-800">{roomTypeLabels[selectedRoom.roomType]}</p>
              <p className="text-sm text-sky-600 mt-0.5">{selectedRoom.pricePerNight.toLocaleString('uk')} ₴ за ніч · до {selectedRoom.capacity} гостей</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Дата заїзду" type="date"
                error={errors.checkInDate?.message} {...register('checkInDate')} />
              <Input label="Дата виїзду" type="date"
                error={errors.checkOutDate?.message} {...register('checkOutDate')} />
            </div>

            <Input label="Кількість гостей" type="number"
              min={1} max={selectedRoom.capacity}
              error={errors.guestsCount?.message}
              {...register('guestsCount', { valueAsNumber: true })} />

            {travels && travels.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-600">Прив'язати до подорожі</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  {...register('travelId')}>
                  <option value="">Без подорожі</option>
                  {travels.map((t) => (
                    <option key={t.id} value={t.id}>{t.destination}</option>
                  ))}
                </select>
              </div>
            )}

            <Input label="Побажання (необов'язково)"
              placeholder="Наприклад: тихий номер, ранній заїзд..."
              {...register('specialRequests')} />

            {bookingMutation.isError && (
              <p className="text-red-500 text-sm">Помилка бронювання. Перевірте дати та кількість гостей.</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={bookingMutation.isPending} className="flex-1">
                Підтвердити бронювання
              </Button>
              <Button type="button" variant="ghost" onClick={handleCloseModal}>Скасувати</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}