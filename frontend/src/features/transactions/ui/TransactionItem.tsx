import type { Transaction } from '@/entities/transaction/model/types';
import type { Category } from '@/entities/category/model/types';
import { Badge } from '@/shared/ui/badge';

type TransactionItemProps = {
  transaction: Transaction;
  category: Category | undefined;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('ru-RU');

export function TransactionItem({ transaction, category }: TransactionItemProps) {
  const isIncome = transaction.type === 'INCOME';

  return (
    <li className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: category?.color ?? '#94a3b8' }}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {category?.name ?? 'Без категории'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {transaction.description ?? '—'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="text-xs text-muted-foreground">{formatDate(transaction.date)}</span>
        <Badge variant={isIncome ? 'income' : 'expense'}>
          {isIncome ? 'Доход' : 'Расход'}
        </Badge>
        <span className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
          {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
        </span>
      </div>
    </li>
  );
}
