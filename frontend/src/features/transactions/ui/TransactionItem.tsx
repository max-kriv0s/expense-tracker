import type { Transaction } from '@/entities/transaction/model/types';
import type { Category } from '@/entities/category/model/types';
import { formatCurrency } from '@/shared/lib/utils';

type TransactionItemProps = {
  transaction: Transaction;
  category: Category | undefined;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

export function TransactionItem({ transaction, category }: TransactionItemProps) {
  const isIncome = transaction.type === 'INCOME';

  return (
    <li className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/70 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: category?.color ?? '#94a3b8' }}
        >
          {(category?.name ?? '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {category?.name ?? 'Без категории'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {transaction.description ?? formatDate(transaction.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="text-xs text-muted-foreground hidden sm:block tabular-nums">
          {formatTime(transaction.date)}
        </span>
        <span
          className={`text-sm font-semibold tabular-nums ${
            isIncome ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
        </span>
        <span
          className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
            isIncome
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-500'
          }`}
        >
          {isIncome ? 'Доход' : 'Расход'}
        </span>
      </div>
    </li>
  );
}
