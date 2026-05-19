'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { authApi } from '@/features/auth/api/authApi';
import { Button } from '@/shared/ui/button';
import type { User } from '@/entities/user/model/types';

export function DashboardSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    authApi.me(token).then(setUser).catch(() => null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Транзакции' },
    { href: '/dashboard/categories', label: 'Категории' },
  ];

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-foreground">Expense Tracker</h1>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild={false}
              >
                {label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4 mt-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Выйти">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
