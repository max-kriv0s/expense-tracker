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
    <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'hsl(220 14% 92%)' }}>
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            activeFilter === value
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
