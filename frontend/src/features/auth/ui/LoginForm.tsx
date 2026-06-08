'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { authApi } from '@/features/auth/api/authApi';
import { loginSchema, type LoginFormValues } from '@/features/auth/model/schemas';
import { Wallet } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const tokens = await authApi.login(values);
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      router.push('/dashboard');
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Ошибка входа',
      });
    }
  };

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-8"
      style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
    >
      {/* Logo mark */}
      <div className="flex items-center gap-2.5 mb-8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#16172A' }}
        >
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-foreground">Expense Tracker</span>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Добро пожаловать</h1>
      <p className="text-sm text-muted-foreground mb-7">
        Введите данные для входа в аккаунт
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {errors.root && (
          <div className="rounded-xl px-4 py-3 text-sm text-red-600 bg-red-50">
            {errors.root.message}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="rounded-xl"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="rounded-xl"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60 mt-1"
          style={{ backgroundColor: '#16172A' }}
        >
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>

        <p className="text-sm text-muted-foreground text-center">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-foreground font-medium hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}
