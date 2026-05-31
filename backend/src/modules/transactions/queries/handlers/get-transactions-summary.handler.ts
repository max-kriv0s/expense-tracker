import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetTransactionsSummaryQuery } from '../get-transactions-summary.query';
import { TransactionSummary } from '../../../../types';

@QueryHandler(GetTransactionsSummaryQuery)
export class GetTransactionsSummaryHandler implements IQueryHandler<GetTransactionsSummaryQuery> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Агрегирует транзакции за указанный месяц и возвращает суммы по типам.
   * Период вычисляется в UTC: от первого числа месяца до первого числа следующего (не включительно).
   * @param query - Пользователь, месяц (1–12) и год.
   * @returns Объект с полями `totalIncome`, `totalExpense` и `balance` (разница).
   */
  async execute(query: GetTransactionsSummaryQuery): Promise<TransactionSummary> {
    const { userId, month, year } = query;

    const dateFrom = new Date(Date.UTC(year, month - 1, 1));
    const dateTo = new Date(Date.UTC(year, month, 1));

    const result = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, date: { gte: dateFrom, lt: dateTo } },
      _sum: { amount: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    for (const row of result) {
      const value = parseFloat((row._sum.amount ?? 0).toString());
      if (row.type === 'INCOME') totalIncome = value;
      else totalExpense = value;
    }

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }
}
