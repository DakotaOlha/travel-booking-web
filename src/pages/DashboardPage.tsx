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

  // Тільки COMPLETED бронювання
  const totalSpent = report?.bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalPrice, 0) ?? 0;

  const stats = [
    { label: 'Всього бронювань', value: report?.totalBookings ?? 0, sub: 'всі статуси' },
    { label: 'Витрачено', value: `${totalSpent.toLocaleString('uk')} ₴`, sub: 'завершені' },
    { label: 'Підтверджені', value: report?.byStatus?.CONFIRMED ?? 0, sub: 'активні' },
    { label: 'Подорожей', value: travels?.length ?? 0, sub: 'всього' },
  ];

  return (
    <div className="space-y-8">
      <div className="pb-2">
        <h1 className="text-2xl font-semibold text-slate-800">
          Вітаємо, {user?.firstName}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Огляд вашого особистого кабінету</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">{stat.value}</p>
            <p className="text-xs text-sky-500 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-700 text-sm">Останні бронювання</h2>
            <Link to="/bookings" className="text-xs text-sky-500 hover:text-sky-600 font-medium">Переглянути всі</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBookings.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">Бронювань ще немає</div>
            ) : (
              recentBookings.map((b) => (
                <Link key={b.id} to={`/bookings/${b.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{b.hotel?.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(b.checkInDate).toLocaleDateString('uk')} — {new Date(b.checkOutDate).toLocaleDateString('uk')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge color={bookingStatusColor[b.status]}>{b.status}</Badge>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{b.totalPrice.toLocaleString('uk')} ₴</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Travels */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-700 text-sm">Заплановані подорожі</h2>
            <Link to="/travels" className="text-xs text-sky-500 hover:text-sky-600 font-medium">Переглянути всі</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingTravels.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">Немає запланованих подорожей</div>
            ) : (
              upcomingTravels.map((t) => (
                <Link key={t.id} to={`/travels/${t.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.destination}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(t.startDate).toLocaleDateString('uk')} — {new Date(t.endDate).toLocaleDateString('uk')}
                    </p>
                  </div>
                  <Badge color={travelStatusColor[t.status]}>{t.status}</Badge>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}