import { Skeleton } from '@/shared/ui/skeleton';
import { Pagination } from '@/shared/ui/pagination';
import { TransactionItem } from '@/features/transactions/ui/TransactionItem';
import type { Transaction } from '@/entities/transaction/model/types';
import type { Category } from '@/entities/category/model/types';

type TransactionListProps = {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function TransactionList({
  transactions,
  categories,
  isLoading,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}: TransactionListProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedItems = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Транзакции не найдены
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-border">
        {paginatedItems.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} category={categoryMap.get(tx.categoryId)} />
        ))}
      </ul>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
