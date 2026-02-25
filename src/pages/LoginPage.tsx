import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  email: z.string().email('Невірний email'),
  password: z.string().min(1, 'Введіть пароль'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authApi.login(data.email, data.password),
    onSuccess: (data) => {
      login(data.access_token, data.user);
      navigate('/dashboard');
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✈️</div>
          <h1 className="text-2xl font-bold text-gray-900">TravelBook</h1>
          <p className="text-gray-500 mt-1">Увійдіть до свого акаунту</p>
        </div>

        {mutation.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            Невірний email або пароль
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="user@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Пароль" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <Button type="submit" size="lg" loading={mutation.isPending} className="mt-2">
            Увійти
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Немає акаунту?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">Зареєструватись</Link>
        </p>
      </div>
    </div>
  );
}