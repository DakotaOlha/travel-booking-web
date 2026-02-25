import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { travelsApi } from '../api/travels';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge, travelStatusColor, bookingStatusColor } from '../components/ui/Badge';
import type { TravelStatus } from '../types';

const schema = z.object({
  destination: z.string().min(1, "Обов'язкове поле"),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED']),
});
type FormData = z.infer<typeof schema>;

const statusLabels: Record<string, string> = {
  PLANNED: 'Заплановано', ONGOING: 'В дорозі',
  COMPLETED: 'Завершено', CANCELLED: 'Скасовано',
};

export function TravelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data: travel, isLoading } = useQuery({
    queryKey: ['travel', id],
    queryFn: () => travelsApi.getOne(id!),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => travelsApi.update(id!, {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travel', id] });
      qc.invalidateQueries({ queryKey: ['travels'] });
      setEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => travelsApi.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travels'] });
      navigate('/travels');
    },
  });

  const handleEditOpen = () => {
    if (!travel) return;
    reset({
      destination: travel.destination,
      startDate: travel.startDate.split('T')[0],
      endDate: travel.endDate.split('T')[0],
      description: travel.description ?? '',
      status: travel.status,
    });
    setEditOpen(true);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!travel) return <div className="text-center py-16 text-slate-400">Подорож не знайдено</div>;

  const nights = travel.bookings?.reduce((sum, b) => {
    const diff = new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime();
    return sum + Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, 0) ?? 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
        ← Назад до подорожей
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className={`h-2 w-full ${travel.status === 'PLANNED' ? 'bg-gradient-to-r from-sky-400 to-sky-300' :
            travel.status === 'ONGOING' ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' :
              travel.status === 'COMPLETED' ? 'bg-gradient-to-r from-slate-300 to-slate-200' :
                'bg-gradient-to-r from-red-300 to-red-200'
          }`} />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">{travel.destination}</h1>
              <p className="text-slate-500 mt-1 text-sm">
                {new Date(travel.startDate).toLocaleDateString('uk', { day: 'numeric', month: 'long', year: 'numeric' })} —{' '}
                {new Date(travel.endDate).toLocaleDateString('uk', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {travel.description && (
                <p className="text-slate-600 mt-3 text-sm">{travel.description}</p>
              )}
            </div>
            <Badge color={travelStatusColor[travel.status]}>{statusLabels[travel.status]}</Badge>
          </div>

          {nights > 0 && (
            <div className="flex gap-6 mt-5 pt-5 border-t border-slate-50">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Ночей</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{nights}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Бронювань</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{travel.bookings?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Витрачено</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">
                  {travel.bookings?.reduce((s, b) => s + b.totalPrice, 0).toLocaleString('uk')} ₴
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <Button size="sm" variant="ghost" onClick={handleEditOpen}>Редагувати</Button>
            <Button size="sm" variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => { if (confirm('Видалити подорож?')) deleteMutation.mutate(); }}>
              Видалити
            </Button>
          </div>
        </div>
      </div>

      {/* Bookings */}
      {travel.bookings && travel.bookings.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-3">Бронювання в цій подорожі</h2>
          <div className="space-y-3">
            {travel.bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-700">{b.hotel?.name}</p>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {new Date(b.checkInDate).toLocaleDateString('uk')} — {new Date(b.checkOutDate).toLocaleDateString('uk')}
                      {b.room && ` · ${b.room.roomType}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={bookingStatusColor[b.status]}>{b.status}</Badge>
                    <span className="font-semibold text-slate-700">{b.totalPrice.toLocaleString('uk')} ₴</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Редагувати подорож">
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
          <Input label="Напрямок" error={errors.destination?.message} {...register('destination')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Дата початку" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Input label="Дата закінчення" type="date" error={errors.endDate?.message} {...register('endDate')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">Статус</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400" {...register('status')}>
              {(['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'] as TravelStatus[]).map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>
          <Input label="Опис" {...register('description')} />
          {updateMutation.isError && <p className="text-red-500 text-sm">Помилка збереження</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={updateMutation.isPending} className="flex-1">Зберегти</Button>
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Скасувати</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}