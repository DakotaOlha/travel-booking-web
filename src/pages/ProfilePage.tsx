import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface FormData { firstName: string; lastName: string; phone?: string; }

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: { firstName: user?.firstName, lastName: user?.lastName, phone: user?.phone ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.patch(`/users/${user?.id}`, data).then(r => r.data),
  });

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">👤 Профіль</h1>
      <Card>
        <p className="text-sm text-gray-500 mb-4">📧 {user?.email}</p>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ім'я" {...register('firstName')} />
            <Input label="Прізвище" {...register('lastName')} />
          </div>
          <Input label="Телефон" type="tel" {...register('phone')} />
          {mutation.isSuccess && <p className="text-green-500 text-sm">Збережено ✓</p>}
          <Button type="submit" loading={mutation.isPending}>Зберегти зміни</Button>
        </form>
      </Card>
      <Button variant="danger" onClick={logout}>Вийти з акаунту</Button>
    </div>
  );
}