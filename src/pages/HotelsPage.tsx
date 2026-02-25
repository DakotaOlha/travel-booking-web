import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { hotelsApi } from '../api/hotels';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function HotelsPage() {
  const [search, setSearch] = useState({ location: '', name: '' });
  const [filters, setFilters] = useState({ location: '', name: '', page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ['hotels', filters],
    queryFn: () => hotelsApi.getAll(filters),
  });

  const handleSearch = () => setFilters({ ...search, page: 1 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🏨 Готелі</h1>

      {/* Фільтри */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Місто (напр. Київ)"
            value={search.location}
            onChange={(e) => setSearch(s => ({ ...s, location: e.target.value }))}
            className="w-48"
          />
          <Input
            placeholder="Назва готелю"
            value={search.name}
            onChange={(e) => setSearch(s => ({ ...s, name: e.target.value }))}
            className="w-48"
          />
          <Button onClick={handleSearch}>🔍 Пошук</Button>
          <Button variant="ghost" onClick={() => { setSearch({ location: '', name: '' }); setFilters({ location: '', name: '', page: 1 }); }}>
            Скинути
          </Button>
        </div>
      </Card>

      {/* Список */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Завантаження...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data.map((hotel) => (
              <Link key={hotel.id} to={`/hotels/${hotel.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full" padding>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                    {hotel.rating && (
                      <span className="text-sm text-amber-500 font-medium">⭐ {hotel.rating}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">📍 {hotel.location}</p>
                  <p className="text-sm text-gray-400 mb-3">{hotel.address}</p>
                  {hotel.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{hotel.description}</p>
                  )}
                  {hotel.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {hotel.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="text-xs text-gray-400">+{hotel.amenities.length - 3}</span>
                      )}
                    </div>
                  )}
                  {hotel.rooms && (
                    <p className="text-xs text-gray-400 mt-3">
                      🛏 {hotel.rooms.filter(r => r.available).length} вільних кімнат
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>

          {/* Пагінація */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === filters.page ? 'primary' : 'ghost'}
                  onClick={() => setFilters(f => ({ ...f, page: p }))}
                >
                  {p}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}