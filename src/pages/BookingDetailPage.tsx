import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, bookingStatusColor } from '../components/ui/Badge';

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getOne(id!),
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.update(id!, { status: 'CANCELLED' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => bookingsApi.delete(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); navigate('/bookings'); },
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Завантаження...</div>;
  if (!booking) return <div className="text-center py-12 text-red-400">Бронювання не знайдено</div>;

  const nights = Math.ceil(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">← Назад</button>

      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{booking.hotel?.name}</h1>
            <p className="text-sm text-gray-500 mt-1">#{booking.bookingNumber.split('-')[0].toUpperCase()}</p>
          </div>
          <Badge color={bookingStatusColor[booking.status]}>{booking.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Заїзд</p>
            <p className="font-medium">{new Date(booking.checkInDate).toLocaleDateString('uk')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Виїзд</p>
            <p className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString('uk')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Кімната</p>
            <p className="font-medium">{booking.room?.roomType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Гостей</p>
            <p className="font-medium">{booking.guestsCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Ночей</p>
            <p className="font-medium">{nights}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Загальна сума</p>
            <p className="font-bold text-blue-600">{booking.totalPrice} ₴</p>
          </div>
        </div>

        {booking.specialRequests && (
          <div className="mt-4">
            <p className="text-xs text-gray-400">Побажання</p>
            <p className="text-sm mt-1">{booking.specialRequests}</p>
          </div>
        )}
        {booking.travel && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-400">Подорож</p>
            <p className="text-sm font-medium">✈️ {booking.travel.destination}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
            <Button variant="danger" loading={cancelMutation.isPending}
              onClick={() => { if (confirm('Скасувати?')) cancelMutation.mutate(); }}>
              Скасувати бронювання
            </Button>
          )}
          {booking.status === 'CANCELLED' && (
            <Button variant="ghost" loading={deleteMutation.isPending}
              onClick={() => { if (confirm('Видалити?')) deleteMutation.mutate(); }}>
              Видалити
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}