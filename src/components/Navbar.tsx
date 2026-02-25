import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

const navItems = [
  { to: '/dashboard', label: '🏠 Головна' },
  { to: '/hotels', label: '🏨 Готелі' },
  { to: '/travels', label: '✈️ Подорожі' },
  { to: '/bookings', label: '📋 Бронювання' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="font-bold text-xl text-blue-600">
            ✈️ TravelBook
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname.startsWith(to)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/profile" className="text-sm text-gray-700 hover:text-blue-600 font-medium">
            👤 {user?.firstName} {user?.lastName}
          </Link>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Вийти
          </button>
        </div>
      </div>
    </header>
  );
}