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
  startDate: z.string().min(1, 'Вкажіть дату'),
  endDate: z.string().min(1, 'Вкажіть дату'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const statusLabels: Record<string, string> = {
  PLANNED: 'Заплановано',
  ONGOING: 'В дорозі',
  COMPLETED: 'Завершено',
  CANCELLED: 'Скасовано',
};

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
    mutationFn: (data: FormData) => travelsApi.create({
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travels'] });
      setModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => travelsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travels'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Подорожі</h1>
          <p className="text-slate-400 text-sm mt-0.5">{travels?.length ?? 0} записів</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Нова подорож</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400">Завантаження...</div>
      ) : travels?.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg font-medium text-slate-600 mb-1">Подорожей ще немає</p>
            <p className="text-sm mb-6">Створіть свою першу подорож щоб почати планування</p>
            <Button onClick={() => setModalOpen(true)}>Створити подорож</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {travels?.map((travel) => (
            <div key={travel.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
              {/* Color bar by status */}
              <div className={`h-1 w-full ${travel.status === 'PLANNED' ? 'bg-sky-400' :
                  travel.status === 'ONGOING' ? 'bg-emerald-400' :
                    travel.status === 'COMPLETED' ? 'bg-slate-300' : 'bg-red-300'
                }`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 text-base leading-snug pr-2">{travel.destination}</h3>
                  <Badge color={travelStatusColor[travel.status]}>
                    {statusLabels[travel.status]}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mb-2">
                  {new Date(travel.startDate).toLocaleDateString('uk', { day: 'numeric', month: 'short', year: 'numeric' })} —{' '}
                  {new Date(travel.endDate).toLocaleDateString('uk', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {travel.description && (
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{travel.description}</p>
                )}
                {travel.bookings && travel.bookings.length > 0 && (
                  <p className="text-xs text-sky-500 mb-4">{travel.bookings.length} бронювань</p>
                )}
                <div className="flex gap-2 pt-3 border-t border-slate-50">
                  <Link to={`/travels/${travel.id}`} className="flex-1">
                    <Button size="sm" variant="ghost" className="w-full">Деталі</Button>
                  </Link>
                  <Button
                    size="sm" variant="danger"
                    onClick={() => { if (confirm('Видалити подорож?')) deleteMutation.mutate(travel.id); }}
                  >
                    Видалити
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Нова подорож">
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
          <Input label="Напрямок" placeholder="наприклад, Відень, Австрія"
            error={errors.destination?.message} {...register('destination')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Дата початку" type="date"
              error={errors.startDate?.message} {...register('startDate')} />
            <Input label="Дата закінчення" type="date"
              error={errors.endDate?.message} {...register('endDate')} />
          </div>
          <Input label="Опис" placeholder="Короткий опис (необов'язково)" {...register('description')} />
          {createMutation.isError && (
            <p className="text-red-500 text-sm">Помилка. Перевірте дані.</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={createMutation.isPending} className="flex-1">Створити</Button>
            <Button type="button" variant="ghost" onClick={() => { setModalOpen(false); reset(); }}>Скасувати</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}