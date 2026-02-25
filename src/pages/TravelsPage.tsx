import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { travelsApi } from '../api/travels';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge, travelStatusColor } from '../components/ui/Badge';

const schema = z.object({
  destination: z.string().min(1, "Обов'язкове поле"),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function TravelsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: travels, isLoading } = useQuery({
    queryKey: ['travels'],
    queryFn: travelsApi.getAll,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => travelsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travels'] });
      setModalOpen(false);
      reset();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">✈️ Мої подорожі</h1>
        <Button onClick={() => setModalOpen(true)}>+ Нова подорож</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Завантаження...</div>
      ) : travels?.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-3">✈️</div>
            <p>Подорожей ще немає</p>
            <Button className="mt-4" onClick={() => setModalOpen(true)}>Створити першу подорож</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {travels?.map((travel) => (
            <Link key={travel.id} to={`/travels/${travel.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full" padding>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">📍 {travel.destination}</h3>
                  <Badge color={travelStatusColor[travel.status]}>{travel.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(travel.startDate).toLocaleDateString('uk')} – {new Date(travel.endDate).toLocaleDateString('uk')}
                </p>
                {travel.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{travel.description}</p>}
                {travel.bookings && (
                  <p className="text-xs text-gray-400 mt-3">📋 {travel.bookings.length} бронювань</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Нова подорож">
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
          <Input label="Напрямок" placeholder="Париж, Франція" error={errors.destination?.message} {...register('destination')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Дата початку" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Input label="Дата закінчення" type="date" error={errors.endDate?.message} {...register('endDate')} />
          </div>
          <Input label="Опис (необов'язково)" placeholder="Короткий опис подорожі..." {...register('description')} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={createMutation.isPending} className="flex-1">Створити</Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Скасувати</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}