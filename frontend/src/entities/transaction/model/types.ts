export type TransactionType = 'INCOME' | 'EXPENSE';

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  date: string;
  categoryId: string;
  userId: string;
  createdAt: string;
};

export type TransactionSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};
