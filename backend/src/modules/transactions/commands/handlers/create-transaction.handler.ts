import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateTransactionCommand } from '../create-transaction.command';
import { Transaction } from '../../../../types';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт транзакцию в БД и возвращает её с конвертированной суммой.
   * @param command - Данные новой транзакции.
   * @returns Созданная транзакция; `amount` приведён к `number` из `Decimal`.
   */
  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    const { userId, amount, type, date, categoryId, description } = command;
    const raw = await this.prisma.transaction.create({
      data: {
        amount,
        type: type as any,
        date: new Date(date),
        categoryId,
        userId,
        description: description ?? null,
      },
    });
    return { ...raw, amount: parseFloat(raw.amount.toString()) };
  }
}
