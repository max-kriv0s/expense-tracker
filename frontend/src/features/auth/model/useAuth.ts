'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(): string | null {
  const [token, setToken] = useState<string | null>(null);
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
