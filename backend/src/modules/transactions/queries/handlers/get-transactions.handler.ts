import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetTransactionsQuery } from '../get-transactions.query';
import { Transaction } from '../../../../types';

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTransactionsQuery): Promise<Transaction[]> {
    const { userId, dateFrom, dateTo, type, categoryId } = query;

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.date = dateFilter;
    }

    const rows = await this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return rows.map((r) => ({ ...r, amount: parseFloat(r.amount.toString()) }));
  }
}
