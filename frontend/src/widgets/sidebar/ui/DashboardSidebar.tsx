'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Tags, LogOut, Wallet, History } from 'lucide-react';
import { authApi } from '@/features/auth/api/authApi';
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
    { href: '/dashboard', label: 'Транзакции', icon: LayoutDashboard },
    { href: '/dashboard/categories', label: 'Категории', icon: Tags },
  ];

  return (
    <div className="flex flex-col h-full px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10 px-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        >
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-[15px] tracking-tight">
          Expense Tracker
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-white'
                  : 'hover:text-white/80'
              }`}
              style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : undefined,
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom info card */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        >
          <History className="w-4 h-4 text-white/70" />
        </div>
        <p className="text-white text-sm font-semibold mb-1">История доступна</p>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Проверяйте еженедельные отчёты по транзакциям
        </p>
      </div>

      {/* User */}
      <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {user && (
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
              }}
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
