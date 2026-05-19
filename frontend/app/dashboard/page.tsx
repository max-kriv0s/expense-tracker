'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { transactionsApi } from '@/features/transactions/api/transactionsApi';
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
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<TransactionFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (!stored) {
      router.replace('/login');
    } else {
      setToken(stored);
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    setIsLoading(true);
    setError(null);

    Promise.all([
      transactionsApi.getSummary(token, month, year),
      transactionsApi.getAll(token),
      transactionsApi.getCategories(token),
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
          router.replace('/login');
        } else {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
        }
      })
      .finally(() => setIsLoading(false));
  }, [token, router]);

  const handleFilterChange = (f: TransactionFilter) => {
    setFilter(f);
    setCurrentPage(1);
  };

  const handleTransactionCreated = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    setIsModalOpen(false);
    // обновляем сводку
    if (token) {
      const now = new Date();
      transactionsApi
        .getSummary(token, now.getMonth() + 1, now.getFullYear())
        .then(setSummary)
        .catch(() => null);
    }
  };

  if (token === null) return null;

  const filteredTransactions =
    filter === 'ALL' ? transactions : transactions.filter((t) => t.type === filter);

  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive text-sm">{error}</p>
        <button
          className="text-sm underline text-muted-foreground"
          onClick={() => setToken((t) => t)}
        >
          Попробовать снова
        </button>
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
            totalItems={filteredTransactions.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {token && (
        <CreateTransactionModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleTransactionCreated}
          onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
          categories={categories}
          token={token}
        />
      )}
    </>
  );
}
