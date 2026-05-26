'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// undefined = токен ещё не проверен / не найден (идёт редирект), string = токен готов
export function useAuth(): string | undefined {
  const [token, setToken] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (!stored) {
      router.replace('/login');
    } else {
      setToken(stored);
    }
  }, [router]);

  return token;
}
