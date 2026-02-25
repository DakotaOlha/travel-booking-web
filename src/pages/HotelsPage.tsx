import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { hotelsApi } from '../api/hotels';
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
  const handleReset = () => {
    setSearch({ location: '', name: '' });
    setFilters({ location: '', name: '', page: 1 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Готелі</h1>
        <p className="text-slate-400 text-sm mt-0.5">{data?.meta.total ?? 0} готелів знайдено</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Місто або країна"
            value={search.location}
            onChange={(e) => setSearch(s => ({ ...s, location: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-52"
          />
          <Input
            placeholder="Назва готелю"
            value={search.name}
            onChange={(e) => setSearch(s => ({ ...s, name: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-52"
          />
          <Button onClick={handleSearch}>Пошук</Button>
          {(filters.location || filters.name) && (
            <Button variant="ghost" onClick={handleReset}>Скинути</Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="font-medium text-slate-600 mb-1">Готелів не знайдено</p>
          <p className="text-sm">Спробуйте змінити фільтри пошуку</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.data.map((hotel) => (
              <Link key={hotel.id} to={`/hotels/${hotel.id}`}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-sky-50 to-sky-100 px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-base leading-snug">{hotel.name}</h3>
                      {hotel.rating && (
                        <span className="flex-shrink-0 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                          {hotel.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{hotel.location}</p>
                  </div>

                  <div className="p-5 pt-4">
                    <p className="text-xs text-slate-400 mb-3">{hotel.address}</p>
                    {hotel.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4">{hotel.description}</p>
                    )}
                    {hotel.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {hotel.amenities.slice(0, 4).map((a) => (
                          <span key={a} className="text-xs bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.5 rounded-full">
                            {a}
                          </span>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <span className="text-xs text-slate-400">+{hotel.amenities.length - 4}</span>
                        )}
                      </div>
                    )}
                    {hotel.rooms && (
                      <p className="text-xs font-medium text-slate-500">
                        {hotel.rooms.filter(r => r.available).length} вільних кімнат з {hotel.rooms.length}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
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