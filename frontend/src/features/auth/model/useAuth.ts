'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// undefined = токен не найден (идёт редирект), string = токен готов
export function useAuth(): string | undefined {
  const router = useRouter();
  const [token] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem('access_token') ?? undefined;
  });

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  return token;
}
