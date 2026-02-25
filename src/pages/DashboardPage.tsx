import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';
import { travelsApi } from '../api/travels';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge, bookingStatusColor, travelStatusColor } from '../components/ui/Badge';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: report } = useQuery({ queryKey: ['booking-report'], queryFn: bookingsApi.getReport });
  const { data: travels } = useQuery({ queryKey: ['travels'], queryFn: travelsApi.getAll });

  const recentBookings = report?.bookings.slice(0, 3) ?? [];
  const upcomingTravels = travels?.filter(t => t.status === 'PLANNED').slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      {/* Привітання */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Привіт, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Ваш особистий кабінет</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Всього бронювань', value: report?.totalBookings ?? 0, icon: '📋', color: 'text-blue-600' },
          { label: 'Витрачено', value: `${report?.totalSpent?.toFixed(0) ?? 0} ₴`, icon: '💰', color: 'text-green-600' },
          { label: 'Підтверджені', value: report?.byStatus?.CONFIRMED ?? 0, icon: '✅', color: 'text-green-600' },
          { label: 'Подорожей', value: travels?.length ?? 0, icon: '✈️', color: 'text-purple-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Останні бронювання */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Останні бронювання</h2>
            <Link to="/bookings" className="text-sm text-blue-600 hover:underline">Всі →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">Бронювань ще немає</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <Link key={b.id} to={`/bookings/${b.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{b.hotel?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(b.checkInDate).toLocaleDateString('uk')} – {new Date(b.checkOutDate).toLocaleDateString('uk')}</p>
                  </div>
                  <div className="text-right">
                    <Badge color={bookingStatusColor[b.status]}>{b.status}</Badge>
                    <p className="text-sm font-medium mt-1">{b.totalPrice} ₴</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Майбутні подорожі */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Заплановані подорожі</h2>
            <Link to="/travels" className="text-sm text-blue-600 hover:underline">Всі →</Link>
          </div>
          {upcomingTravels.length === 0 ? (
            <p className="text-gray-400 text-sm">Немає запланованих подорожей</p>
          ) : (
            <div className="space-y-3">
              {upcomingTravels.map((t) => (
                <Link key={t.id} to={`/travels/${t.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">📍 {t.destination}</p>
                    <p className="text-xs text-gray-400">{new Date(t.startDate).toLocaleDateString('uk')} – {new Date(t.endDate).toLocaleDateString('uk')}</p>
                  </div>
                  <Badge color={travelStatusColor[t.status]}>{t.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}