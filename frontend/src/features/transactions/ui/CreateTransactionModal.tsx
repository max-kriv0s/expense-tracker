'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { transactionsApi } from '@/features/transactions/api/transactionsApi';
import { createTransactionSchema, type CreateTransactionFormData } from '@/features/transactions/model/schemas';
import type { Category } from '@/entities/category/model/types';
import type { Transaction } from '@/entities/transaction/model/types';

type CreateTransactionModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (tx: Transaction) => void;
  categories: Category[];
  token: string;
};

const today = () => new Date().toISOString().split('T')[0];

export function CreateTransactionModal({
  open,
  onClose,
  onCreated,
  categories,
  token,
}: CreateTransactionModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { type: 'EXPENSE', date: today() },
  });

  const selectedType = watch('type');

  const handleClose = () => {
    reset({ type: 'EXPENSE', date: today() });
    setServerError(null);
    onClose();
  };

  const onSubmit = async (data: CreateTransactionFormData) => {
    setServerError(null);
    try {
      const tx = await transactionsApi.create(token, {
        ...data,
        description: data.description || undefined,
      });
      reset({ type: 'EXPENSE', date: today() });
      onCreated(tx);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ошибка при создании');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Новая транзакция">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Тип */}
        <div className="flex gap-2">
          {(['EXPENSE', 'INCOME'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('type', type)}
              className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                selectedType === type
                  ? type === 'INCOME'
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : 'bg-red-100 border-red-400 text-red-700'
                  : 'bg-background border-input text-muted-foreground hover:bg-muted'
              }`}
            >
              {type === 'INCOME' ? 'Доход' : 'Расход'}
            </button>
          ))}
        </div>

        {/* Сумма */}
        <div className="space-y-1">
          <Label htmlFor="amount">Сумма</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            {...register('amount')}
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        {/* Категория */}
        <div className="space-y-1">
          <Label htmlFor="categoryId">Категория</Label>
          <select
            id="categoryId"
            {...register('categoryId')}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-destructive">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Дата */}
        <div className="space-y-1">
          <Label htmlFor="date">Дата</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        {/* Описание */}
        <div className="space-y-1">
          <Label htmlFor="description">Описание (необязательно)</Label>
          <Input id="description" placeholder="Комментарий..." {...register('description')} />
        </div>

        {serverError && <p className="text-xs text-destructive">{serverError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Создать'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
