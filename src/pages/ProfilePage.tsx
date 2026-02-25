import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface FormData { firstName: string; lastName: string; phone?: string; }

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { register, handleSubmit, formState: { isDirty } } = useForm<FormData>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.patch(`/users/${user?.id}`, data).then(r => r.data),
  });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Профіль</h1>
        <p className="text-slate-400 text-sm mt-0.5">Керуйте даними свого акаунту</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-sky-100 flex-shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="font-bold text-slate-800 text-lg">{user?.firstName} {user?.lastName}</p>
          <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-700 mb-5 text-sm uppercase tracking-wide">Особисті дані</h2>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ім'я" {...register('firstName')} />
            <Input label="Прізвище" {...register('lastName')} />
          </div>
          <Input label="Телефон" type="tel" placeholder="+380..." {...register('phone')} />

          {mutation.isSuccess && (
            <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm">
              Зміни збережено
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending} disabled={!isDirty && !mutation.isIdle}>
              Зберегти зміни
            </Button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-50 shadow-sm p-6">
        <h2 className="font-semibold text-red-400 mb-3 text-sm uppercase tracking-wide">Вихід</h2>
        <p className="text-slate-400 text-sm mb-4">Ви будете перенаправлені на сторінку входу.</p>
        <Button variant="danger" onClick={logout}>Вийти з акаунту</Button>
      </div>
    </div>
  );
}