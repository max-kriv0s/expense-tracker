import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteTransactionCommand } from '../delete-transaction.command';
import { Transaction } from '../../../../types';

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteTransactionCommand): Promise<Transaction> {
    const { id, userId } = command;

    const existing = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Транзакция не найдена');

    const raw = await this.prisma.transaction.delete({ where: { id } });
    return { ...raw, amount: parseFloat(raw.amount.toString()) };
  }
}
