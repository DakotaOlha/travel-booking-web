import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  email: z.string().email('Невірний email'),
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✈️</div>
          <h1 className="text-2xl font-bold text-gray-900">Реєстрація</h1>
        </div>

        {mutation.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            Помилка реєстрації. Можливо, email вже використовується.
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ім'я" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Прізвище" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Пароль" type="password" error={errors.password?.message} {...register('password')} />
          <Input label="Телефон (необов'язково)" type="tel" {...register('phone')} />
          <Button type="submit" size="lg" loading={mutation.isPending} className="mt-2">
            Зареєструватись
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Вже є акаунт?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Увійти</Link>
        </p>
      </div>
    </div>
  );
}