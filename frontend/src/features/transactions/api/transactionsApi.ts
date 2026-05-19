import { apiClient } from '@/shared/api/client';
import type { Transaction, TransactionSummary, TransactionType } from '@/entities/transaction/model/types';
import type { Category } from '@/entities/category/model/types';
import type { TransactionFilter } from '@/features/transactions/model/types';

export type CreateTransactionPayload = {
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  description?: string;
};

export const transactionsApi = {
  getAll: (token: string, filter?: TransactionFilter) => {
    const qs = filter && filter !== 'ALL' ? `?type=${filter}` : '';
    return apiClient.get<Transaction[]>(`/transactions${qs}`, token);
  },

  getSummary: (token: string, month: number, year: number) =>
    apiClient.get<TransactionSummary>(
      `/transactions/summary?month=${month}&year=${year}`,
      token,
    ),

  getCategories: (token: string) =>
    apiClient.get<Category[]>('/categories', token),

  create: (token: string, payload: CreateTransactionPayload) =>
    apiClient.post<Transaction>('/transactions', payload, token),
};
