import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import type { TransactionSummary } from '@/entities/transaction/model/types';

type SummaryCardsProps = {
  summary: TransactionSummary | null;
  isLoading: boolean;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Баланс',
      value: summary?.balance,
      color: 'text-foreground',
    },
    {
      title: 'Доходы',
      value: summary?.totalIncome,
      color: 'text-green-600',
    },
    {
      title: 'Расходы',
      value: summary?.totalExpense,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ title, value, color }) => (
        <Card key={title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || value === undefined ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <p className={`text-2xl font-bold ${color}`}>{formatCurrency(value)}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
