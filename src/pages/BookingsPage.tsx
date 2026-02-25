import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';
import { Card } from '../components/ui/Card';
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

export function BookingsPage() {
  const qc = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getAll,
  });

  const { data: report } = useQuery({
    queryKey: ['booking-report'],
    queryFn: bookingsApi.getReport,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.update(id, { status: 'CANCELLED' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['booking-report'] });
    },
  });

  const totalSpent = bookings?.filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalPrice, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Бронювання</h1>
          <p className="text-slate-400 text-sm mt-0.5">{bookings?.length ?? 0} записів</p>
        </div>
        <Link to="/hotels">
          <Button>Знайти готель</Button>
        </Link>
      </div>

      {/* Summary */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div key={status} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-400 font-medium">{label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{report.byStatus?.[status as keyof typeof report.byStatus] ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Spent */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-400 rounded-2xl p-5 text-white">
        <p className="text-sky-100 text-sm font-medium">Витрачено на завершені поїздки</p>
        <p className="text-3xl font-bold mt-1">{totalSpent.toLocaleString('uk')} ₴</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings?.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg font-medium text-slate-600 mb-1">Бронювань ще немає</p>
            <p className="text-sm mb-6">Знайдіть готель і зробіть перше бронювання</p>
            <Link to="/hotels"><Button>Знайти готель</Button></Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings?.map((booking) => (
            <div key={booking.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 p-5">
                {/* Status indicator */}
                <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${booking.status === 'CONFIRMED' ? 'bg-emerald-400' :
                    booking.status === 'PENDING' ? 'bg-amber-400' :
                      booking.status === 'CANCELLED' ? 'bg-red-300' : 'bg-slate-300'
                  }`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-800">{booking.hotel?.name}</h3>
                    <Badge color={bookingStatusColor[booking.status]}>
                      {statusLabels[booking.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {booking.room && `${roomTypeLabels[booking.room.roomType]} · `}
                    {booking.guestsCount} {booking.guestsCount === 1 ? 'гість' : 'гостей'}
                  </p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {new Date(booking.checkInDate).toLocaleDateString('uk', { day: 'numeric', month: 'short' })} —{' '}
                    {new Date(booking.checkOutDate).toLocaleDateString('uk', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {booking.travel && (
                    <p className="text-xs text-sky-500 mt-1">{booking.travel.destination}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-lg font-bold text-slate-800">
                    {booking.totalPrice.toLocaleString('uk')} ₴
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/bookings/${booking.id}`}>
                      <Button size="sm" variant="ghost">Деталі</Button>
                    </Link>
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <Button size="sm" variant="danger"
                        loading={cancelMutation.isPending}
                        onClick={() => { if (confirm('Скасувати бронювання?')) cancelMutation.mutate(booking.id); }}>
                        Скасувати
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}