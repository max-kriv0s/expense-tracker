'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ApiError } from '@/shared/api/client';
import type { Category } from '@/entities/category/model/types';

export default function CategoriesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (!stored) { router.replace('/login'); return; }
    setToken(stored);
    categoriesApi.getAll(stored)
      .then(setCategories)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem('access_token');
          router.replace('/login');
        }
      })
      .finally(() => setIsLoading(false));
  }, [router]);

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

  if (token === null) return null;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Категории</h1>

      {/* Форма добавления */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Название категории"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <Button onClick={handleAdd} disabled={isAdding || !newName.trim()}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {/* Список */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Нет категорий</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border">
          {categories.map((cat) => (
            <li key={cat.id} className="px-4 py-3 text-sm">
              {cat.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
