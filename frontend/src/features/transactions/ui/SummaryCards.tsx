import { Skeleton } from '@/shared/ui/skeleton';
import { formatCurrency } from '@/shared/lib/utils';
import type { TransactionSummary } from '@/entities/transaction/model/types';

type SummaryCardsProps = {
  summary: TransactionSummary | null;
  isLoading: boolean;
};

const Sparkline = ({ color, up }: { color: string; up: boolean }) => (
  <svg width="64" height="28" viewBox="0 0 64 28" fill="none" className="opacity-60">
    {up ? (
      <polyline
        points="0,22 10,18 22,20 32,12 42,8 52,14 64,4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ) : (
      <polyline
        points="0,6 10,10 22,8 32,16 42,20 52,14 64,24"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    )}
  </svg>
);

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Баланс',
      value: summary?.balance,
      bg: '#FFFFFF',
      valueCls: 'text-foreground',
      iconBg: '#16172A',
      iconText: '₽',
      sparkColor: '#94a3b8',
      sparkUp: true,
    },
    {
      title: 'Доходы',
      value: summary?.totalIncome,
      bg: '#EDFAF1',
      valueCls: 'text-green-600',
      iconBg: '#16a34a',
      iconText: '↑',
      sparkColor: '#16a34a',
      sparkUp: true,
    },
    {
      title: 'Расходы',
      value: summary?.totalExpense,
      bg: '#FFF3EC',
      valueCls: 'text-orange-500',
      iconBg: '#f97316',
      iconText: '↓',
      sparkColor: '#f97316',
      sparkUp: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ title, value, bg, valueCls, iconBg, iconText, sparkColor, sparkUp }) => (
        <div
          key={title}
          className="rounded-2xl p-5"
          style={{ backgroundColor: bg, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
              style={{ backgroundColor: iconBg }}
            >
              {iconText}
            </div>
            <Sparkline color={sparkColor} up={sparkUp} />
          </div>
          {isLoading || value === undefined ? (
            <Skeleton className="h-9 w-36 mb-2" />
          ) : (
            <p className={`text-[28px] font-bold leading-none mb-2 ${valueCls}`}>
              {formatCurrency(value)}
            </p>
          )}
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </div>
      ))}
    </div>
  );
}
