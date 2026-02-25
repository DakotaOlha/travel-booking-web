import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, bookingStatusColor } from '../components/ui/Badge';

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📋 Мої бронювання</h1>

      {/* Звіт */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(report.byStatus).map(([status, count]) => (
            <Card key={status} padding>
              <p className="text-xs text-gray-500">{status}</p>
              <p className="text-xl font-bold mt-1">{count}</p>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Завантаження...</div>
      ) : bookings?.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>Бронювань ще немає</p>
            <Link to="/hotels">
              <Button className="mt-4">Знайти готель</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings?.map((booking) => (
            <Card key={booking.id} padding>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{booking.hotel?.name}</h3>
                    <Badge color={bookingStatusColor[booking.status]}>{booking.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    🛏 {booking.room?.roomType} · 👥 {booking.guestsCount} гостей
                  </p>
                  <p className="text-sm text-gray-500">
                    📅 {new Date(booking.checkInDate).toLocaleDateString('uk')} –{' '}
                    {new Date(booking.checkOutDate).toLocaleDateString('uk')}
                  </p>
                  {booking.travel && (
                    <p className="text-xs text-blue-500 mt-1">✈️ {booking.travel.destination}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{booking.totalPrice} ₴</span>
                  <Link to={`/bookings/${booking.id}`}>
                    <Button size="sm" variant="ghost">Деталі</Button>
                  </Link>
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <Button
                      size="sm" variant="danger"
                      loading={cancelMutation.isPending}
                      onClick={() => { if (confirm('Скасувати бронювання?')) cancelMutation.mutate(booking.id); }}
                    >
                      Скасувати
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}