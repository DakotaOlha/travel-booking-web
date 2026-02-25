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
  destination: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED']),
});
type FormData = z.infer<typeof schema>;

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
    mutationFn: (data: FormData) => travelsApi.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travel', id] });
      qc.invalidateQueries({ queryKey: ['travels'] });
      setEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => travelsApi.delete(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['travels'] }); navigate('/travels'); },
  });

  const handleEditOpen = () => {
    if (travel) reset({
      destination: travel.destination,
      startDate: travel.startDate.split('T')[0],
      endDate: travel.endDate.split('T')[0],
      description: travel.description ?? '',
      status: travel.status,
    });
    setEditOpen(true);
  };

  if (isLoading) return <div className="text-center py-12 text-gray-400">Завантаження...</div>;
  if (!travel) return <div className="text-center py-12 text-red-400">Подорож не знайдено</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">← Назад</button>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">📍 {travel.destination}</h1>
            <p className="text-gray-500 mt-1">
              {new Date(travel.startDate).toLocaleDateString('uk')} – {new Date(travel.endDate).toLocaleDateString('uk')}
            </p>
            {travel.description && <p className="text-gray-600 mt-2">{travel.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Badge color={travelStatusColor[travel.status]}>{travel.status}</Badge>
            <Button size="sm" variant="ghost" onClick={handleEditOpen}>✏️ Редагувати</Button>
            <Button size="sm" variant="danger"
              onClick={() => { if (confirm('Видалити подорож?')) deleteMutation.mutate(); }}>
              🗑️
            </Button>
          </div>
        </div>
      </Card>

      {travel.bookings && travel.bookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">📋 Бронювання у цій подорожі</h2>
          <div className="space-y-3">
            {travel.bookings.map((b) => (
              <Card key={b.id} padding>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{b.hotel?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(b.checkInDate).toLocaleDateString('uk')} – {new Date(b.checkOutDate).toLocaleDateString('uk')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={bookingStatusColor[b.status]}>{b.status}</Badge>
                    <span className="font-semibold">{b.totalPrice} ₴</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Редагувати подорож">
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
          <Input label="Напрямок" error={errors.destination?.message} {...register('destination')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Дата початку" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Input label="Дата закінчення" type="date" error={errors.endDate?.message} {...register('endDate')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Статус</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" {...register('status')}>
              {(['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'] as TravelStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <Input label="Опис" {...register('description')} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={updateMutation.isPending} className="flex-1">Зберегти</Button>
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Скасувати</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}