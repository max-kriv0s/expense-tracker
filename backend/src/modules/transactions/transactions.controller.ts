import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateTransactionDto,
  GetSummaryQueryDto,
  GetTransactionsQueryDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { CreateTransactionCommand } from './commands/create-transaction.command';
import { UpdateTransactionCommand } from './commands/update-transaction.command';
import { DeleteTransactionCommand } from './commands/delete-transaction.command';
import { GetTransactionsQuery } from './queries/get-transactions.query';
import { GetTransactionByIdQuery } from './queries/get-transaction-by-id.query';
import { GetTransactionsSummaryQuery } from './queries/get-transactions-summary.query';
import { Transaction, TransactionSummary } from '../../types';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto, @Req() req: Request): Promise<Transaction> {
    const { userId } = req.user as { userId: string };
    return this.commandBus.execute(
      new CreateTransactionCommand(userId, dto.amount, dto.type, dto.date, dto.categoryId, dto.description),
    );
  }

  @Get()
  async findAll(@Query() query: GetTransactionsQueryDto, @Req() req: Request): Promise<Transaction[]> {
    const { userId } = req.user as { userId: string };
    return this.queryBus.execute(
      new GetTransactionsQuery(userId, query.dateFrom, query.dateTo, query.type, query.categoryId),
    );
  }

  @Get('summary')
  async getSummary(@Query() query: GetSummaryQueryDto, @Req() req: Request): Promise<TransactionSummary> {
    const { userId } = req.user as { userId: string };
    return this.queryBus.execute(new GetTransactionsSummaryQuery(userId, query.month, query.year));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<Transaction> {
    const { userId } = req.user as { userId: string };
    return this.queryBus.execute(new GetTransactionByIdQuery(id, userId));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @Req() req: Request,
  ): Promise<Transaction> {
    const { userId } = req.user as { userId: string };
    return this.commandBus.execute(
      new UpdateTransactionCommand(id, userId, dto.amount, dto.type, dto.date, dto.categoryId, dto.description),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<Transaction> {
    const { userId } = req.user as { userId: string };
    return this.commandBus.execute(new DeleteTransactionCommand(id, userId));
  }
}
