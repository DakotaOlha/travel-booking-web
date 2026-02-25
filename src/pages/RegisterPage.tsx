import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Мінімум 6 символів'),
  firstName: z.string().min(1, "Обов'язкове поле"),
  lastName: z.string().min(1, "Обов'язкове поле"),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authApi.register(data),
    onSuccess: () => navigate('/login'),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-400 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-sky-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 5 2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l1.27-.8a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Реєстрація</h1>
          <p className="text-slate-400 text-sm mt-1">Створіть новий акаунт</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {mutation.isError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              Помилка реєстрації. Можливо, email вже використовується.
            </div>
          )}
          {mutation.isSuccess && (
            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm">
              Акаунт створено! Переходжу до входу...
            </div>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ім'я" placeholder="Іван"
                error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Прізвище" placeholder="Петренко"
                error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Email" type="email" placeholder="you@example.com"
              error={errors.email?.message} {...register('email')} />
            <Input label="Пароль" type="password" placeholder="Мінімум 6 символів"
              error={errors.password?.message} {...register('password')} />
            <Input label="Телефон" type="tel" placeholder="+380501234567"
              {...register('phone')} />
            <Button type="submit" size="lg" loading={mutation.isPending} className="w-full mt-2">
              Зареєструватись
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Вже є акаунт?{' '}
            <Link to="/login" className="text-sky-500 font-medium hover:text-sky-600">
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}