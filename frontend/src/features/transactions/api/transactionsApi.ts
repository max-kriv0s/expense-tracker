import { apiClient } from '@/shared/api/client';
import type { Transaction, TransactionSummary, TransactionType } from '@/entities/transaction/model/types';

export type CreateTransactionPayload = {
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  description?: string;
};

export const transactionsApi = {
  getAll: (token: string) =>
    apiClient.get<Transaction[]>('/transactions', token),

  getSummary: (token: string, month: number, year: number) =>
    apiClient.get<TransactionSummary>(
      `/transactions/summary?month=${month}&year=${year}`,
      token,
    ),

  create: (token: string, payload: CreateTransactionPayload) =>
    apiClient.post<Transaction>('/transactions', payload, token),
};
