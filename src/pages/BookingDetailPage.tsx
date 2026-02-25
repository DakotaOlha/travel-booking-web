import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { Button } from '../components/ui/Button';
import { Badge, bookingStatusColor } from '../components/ui/Badge';

const statusLabels: Record<string, string> = {
  PENDING: 'Очікує', CONFIRMED: 'Підтверджено',
  CANCELLED: 'Скасовано', COMPLETED: 'Завершено',
};

const roomTypeLabels: Record<string, string> = {
  SINGLE: 'Одномісний', DOUBLE: 'Двомісний',
  SUITE: 'Люкс', DELUXE: 'Делюкс', FAMILY: 'Сімейний',
};

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
      qc.invalidateQueries({ queryKey: ['booking-report'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => bookingsApi.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      navigate('/bookings');
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!booking) return <div className="text-center py-16 text-slate-400">Бронювання не знайдено</div>;

  const nights = Math.ceil(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
        ← Назад до бронювань
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Top color bar */}
        <div className={`h-1.5 w-full ${booking.status === 'CONFIRMED' ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' :
            booking.status === 'PENDING' ? 'bg-gradient-to-r from-amber-400 to-amber-300' :
              booking.status === 'CANCELLED' ? 'bg-gradient-to-r from-red-300 to-red-200' :
                'bg-gradient-to-r from-slate-200 to-slate-100'
          }`} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-800">{booking.hotel?.name}</h1>
              <p className="text-sm text-slate-400 mt-1 font-mono">
                #{booking.bookingNumber.split('-')[0].toUpperCase()}
              </p>
            </div>
            <Badge color={bookingStatusColor[booking.status]}>
              {statusLabels[booking.status]}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5 border-y border-slate-50">
            {[
              { label: 'Заїзд', value: new Date(booking.checkInDate).toLocaleDateString('uk', { day: 'numeric', month: 'long' }) },
              { label: 'Виїзд', value: new Date(booking.checkOutDate).toLocaleDateString('uk', { day: 'numeric', month: 'long' }) },
              { label: 'Ночей', value: nights },
              { label: 'Тип кімнати', value: booking.room ? roomTypeLabels[booking.room.roomType] : '—' },
              { label: 'Гостей', value: booking.guestsCount },
              { label: 'Сума', value: `${booking.totalPrice.toLocaleString('uk')} ₴` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">{value}</p>
              </div>
            ))}
          </div>

          {booking.specialRequests && (
            <div className="mt-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Побажання</p>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{booking.specialRequests}</p>
            </div>
          )}

          {booking.travel && (
            <div className="mt-4 flex items-center gap-3 bg-sky-50 rounded-xl p-4">
              <div className="flex-1">
                <p className="text-xs text-sky-400 uppercase tracking-wide font-medium">Подорож</p>
                <p className="text-sm font-semibold text-sky-700 mt-0.5">{booking.travel.destination}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
              <Button variant="danger" loading={cancelMutation.isPending}
                onClick={() => { if (confirm('Скасувати бронювання?')) cancelMutation.mutate(); }}>
                Скасувати бронювання
              </Button>
            )}
            {booking.status === 'CANCELLED' && (
              <Button variant="ghost" loading={deleteMutation.isPending}
                onClick={() => { if (confirm('Видалити?')) deleteMutation.mutate(); }}>
                Видалити запис
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}