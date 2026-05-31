import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetTransactionByIdQuery } from '../get-transaction-by-id.query';
import { Transaction } from '../../../../types';

@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler implements IQueryHandler<GetTransactionByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ищет транзакцию по `id` и `userId` одновременно — исключает доступ к чужим записям.
   * @param query - UUID транзакции и идентификатор владельца.
   * @returns Найденная транзакция; `amount` приведён к `number`.
   * @throws {NotFoundException} Если транзакция не найдена или принадлежит другому пользователю.
   */
  async execute(query: GetTransactionByIdQuery): Promise<Transaction> {
    const { id, userId } = query;
    const raw = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!raw) throw new NotFoundException('Транзакция не найдена');
    return { ...raw, amount: parseFloat(raw.amount.toString()) };
  }
}
