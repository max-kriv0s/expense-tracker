import { Button } from '@/shared/ui/button';
import type { TransactionFilter } from '@/features/transactions/model/types';

type TransactionFiltersProps = {
  activeFilter: TransactionFilter;
  onChange: (filter: TransactionFilter) => void;
};

const FILTERS: { value: TransactionFilter; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'INCOME', label: 'Доходы' },
  { value: 'EXPENSE', label: 'Расходы' },
];

export function TransactionFilters({ activeFilter, onChange }: TransactionFiltersProps) {
  return (
    <div className="flex gap-2">
      {FILTERS.map(({ value, label }) => (
        <Button
          key={value}
          variant={activeFilter === value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
