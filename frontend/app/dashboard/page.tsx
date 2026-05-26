'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/model/useAuth';
import { transactionsApi } from '@/features/transactions/api/transactionsApi';
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import { SummaryCards } from '@/features/transactions/ui/SummaryCards';
import { TransactionFilters } from '@/features/transactions/ui/TransactionFilters';
import { TransactionList } from '@/features/transactions/ui/TransactionList';
import { CreateTransactionModal } from '@/features/transactions/ui/CreateTransactionModal';
import { Button } from '@/shared/ui/button';
import { ApiError } from '@/shared/api/client';
import type { Transaction, TransactionSummary } from '@/entities/transaction/model/types';
import type { Category } from '@/entities/category/model/types';
import type { TransactionFilter } from '@/features/transactions/model/types';

const MONTH_NAMES = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

export default function DashboardPage() {
  const token = useAuth();

  // Фиксируем дату один раз при монтировании, чтобы fetch и label были согласованы
  const [now] = useState(() => new Date());

  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<TransactionFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      transactionsApi.getSummary(token, now.getMonth() + 1, now.getFullYear()),
      transactionsApi.getAll(token),
      categoriesApi.getAll(token),
    ])
      .then(([summaryData, txData, catData]) => {
        setSummary(summaryData);
        setTransactions(txData);
        setCategories(catData);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // useAuth перенаправит на /login при следующем монтировании,
          // но токен уже удалён — достаточно перезагрузить
          window.location.replace('/login');
        } else {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
        }
      })
      .finally(() => setIsLoading(false));
  }, [token, now, retryCount]);

  const handleFilterChange = (f: TransactionFilter) => {
    setFilter(f);
    setCurrentPage(1);
  };

  const handleTransactionCreated = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    setIsModalOpen(false);
    if (token) {
      transactionsApi
        .getSummary(token, now.getMonth() + 1, now.getFullYear())
        .then(setSummary)
        .catch(() => null);
    }
  };

  if (!token) return null;

  const filteredTransactions =
    filter === 'ALL' ? transactions : transactions.filter((t) => t.type === filter);

  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={() => setRetryCount((c) => c + 1)}>
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold capitalize">Обзор за {monthLabel}</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Новая транзакция
          </Button>
        </div>

        <SummaryCards summary={summary} isLoading={isLoading} />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Транзакции</h2>
            <TransactionFilters activeFilter={filter} onChange={handleFilterChange} />
          </div>

          <TransactionList
            transactions={filteredTransactions}
            categories={categories}
            isLoading={isLoading}
            currentPage={currentPage}
            pageSize={10}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <CreateTransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleTransactionCreated}
        categories={categories}
        token={token}
      />
    </>
  );
}
