import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateTransactionCommand } from '../update-transaction.command';
import { Transaction } from '../../../../types';

@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateTransactionCommand): Promise<Transaction> {
    const { id, userId, amount, type, date, categoryId, description } = command;

    const existing = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Транзакция не найдена');

    const data: Record<string, unknown> = {};
    if (amount !== undefined) data.amount = amount;
    if (type !== undefined) data.type = type;
    if (date !== undefined) data.date = new Date(date);
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (description !== undefined) data.description = description;

    const raw = await this.prisma.transaction.update({ where: { id }, data });
    return { ...raw, amount: parseFloat(raw.amount.toString()) };
  }
}
