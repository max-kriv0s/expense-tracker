import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number({ invalid_type_error: 'Введите сумму' }).positive('Сумма должна быть больше 0'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  date: z.string().min(1, 'Введите дату'),
  description: z.string().optional(),
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
