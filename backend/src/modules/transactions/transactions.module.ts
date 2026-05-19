import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionHandler } from './commands/handlers/create-transaction.handler';
import { UpdateTransactionHandler } from './commands/handlers/update-transaction.handler';
import { DeleteTransactionHandler } from './commands/handlers/delete-transaction.handler';
import { GetTransactionsHandler } from './queries/handlers/get-transactions.handler';
import { GetTransactionByIdHandler } from './queries/handlers/get-transaction-by-id.handler';
import { GetTransactionsSummaryHandler } from './queries/handlers/get-transactions-summary.handler';

const commands = [CreateTransactionHandler, UpdateTransactionHandler, DeleteTransactionHandler];
const queries = [GetTransactionsHandler, GetTransactionByIdHandler, GetTransactionsSummaryHandler];

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [TransactionsController],
  providers: [PrismaService, ...commands, ...queries],
})
export class TransactionsModule {}
