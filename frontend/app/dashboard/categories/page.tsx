'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/model/useAuth';
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { ApiError } from '@/shared/api/client';
import type { Category } from '@/entities/category/model/types';

export default function CategoriesPage() {
  const token = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    categoriesApi.getAll(token)
      .then(setCategories)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.replace('/login');
        }
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleAdd = async () => {
    if (!newName.trim() || !token) return;
    setIsAdding(true);
    setError(null);
    try {
      const cat = await categoriesApi.create(token, newName.trim());
      setCategories((prev) => [...prev, cat]);
      setNewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally {
      setIsAdding(false);
    }
  };

  if (!token) return null;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-7">Категории</h1>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Название категории"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          className="rounded-xl"
        />
        <Button
          onClick={handleAdd}
          disabled={isAdding || !newName.trim()}
          className="rounded-xl shrink-0 gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm text-red-600 bg-red-50 mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Нет категорий — создайте первую выше</p>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <ul className="divide-y divide-border/60">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-3 px-4 py-3.5">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color ?? '#94a3b8' }}
                />
                <span className="text-sm font-medium">{cat.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
