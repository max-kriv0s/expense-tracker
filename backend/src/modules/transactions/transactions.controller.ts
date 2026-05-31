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
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateTransactionDto,
  GetSummaryQueryDto,
  GetTransactionsQueryDto,
  TransactionResponseDto,
  TransactionSummaryResponseDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { CreateTransactionCommand } from './commands/create-transaction.command';
import { UpdateTransactionCommand } from './commands/update-transaction.command';
import { DeleteTransactionCommand } from './commands/delete-transaction.command';
import { GetTransactionsQuery } from './queries/get-transactions.query';
import { GetTransactionByIdQuery } from './queries/get-transaction-by-id.query';
import { GetTransactionsSummaryQuery } from './queries/get-transactions-summary.query';
import { Transaction, TransactionSummary } from '../../types';

/** REST-контроллер для управления транзакциями текущего пользователя. Все маршруты защищены JWT. */
@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Создаёт новую транзакцию для текущего пользователя.
   * @param dto - Данные транзакции: сумма, тип, дата, категория и опциональное описание.
   * @param req - Express-запрос; из него извлекается `userId` из JWT-payload.
   * @returns Созданная транзакция.
   */
  @Post()
  @ApiOperation({ summary: 'Создать транзакцию' })
  @ApiResponse({ status: 201, description: 'Транзакция успешно создана', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(@Body() dto: CreateTransactionDto, @Req() req: Request): Promise<Transaction> {
    const { userId } = req.user as { userId: string };
    return this.commandBus.execute(
      new CreateTransactionCommand(userId, dto.amount, dto.type, dto.date, dto.categoryId, dto.description),
    );
  }

  /**
   * Возвращает список транзакций текущего пользователя с опциональной фильтрацией.
   * @param query - Фильтры: диапазон дат (`dateFrom`, `dateTo`), тип и категория.
   * @param req - Express-запрос; из него извлекается `userId`.
   * @returns Массив транзакций, отсортированных по дате убывания.
   */
  @Get()
  @ApiOperation({ summary: 'Получить список транзакций', description: 'Возвращает транзакции текущего пользователя с опциональной фильтрацией по дате, типу и категории. Сортировка по дате убывания.' })
  @ApiResponse({ status: 200, description: 'Список транзакций', type: [TransactionResponseDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(@Query() query: GetTransactionsQueryDto, @Req() req: Request): Promise<Transaction[]> {
    const { userId } = req.user as { userId: string };
    return this.queryBus.execute(
      new GetTransactionsQuery(userId, query.dateFrom, query.dateTo, query.type, query.categoryId),
    );
  }

  /**
   * Возвращает сводку доходов, расходов и баланс за указанный месяц.
   * @param query - Параметры периода: `month` (1–12) и `year` (2000–2100).
   * @param req - Express-запрос; из него извлекается `userId`.
   * @returns Объект с полями `totalIncome`, `totalExpense`, `balance`.
   */
  @Get('summary')
  @ApiOperation({ summary: 'Получить сводку за месяц', description: 'Возвращает суммарные доходы, расходы и баланс за указанный месяц и год.' })
  @ApiResponse({ status: 200, description: 'Месячная сводка', type: TransactionSummaryResponseDto })
  @ApiResponse({ status: 400, description: 'Невалидные параметры периода' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getSummary(@Query() query: GetSummaryQueryDto, @Req() req: Request): Promise<TransactionSummary> {
    const { userId } = req.user as { userId: string };
    return this.queryBus.execute(new GetTransactionsSummaryQuery(userId, query.month, query.year));
  }

  /**
   * Возвращает одну транзакцию по её идентификатору.
   * @param id - UUID транзакции.
   * @param req - Express-запрос; из него извлекается `userId`.
   * @returns Найденная транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или не принадлежит пользователю.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить транзакцию по ID' })
  @ApiParam({ name: 'id', description: 'UUID транзакции', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Транзакция найдена', type: TransactionResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена' })
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<Transaction> {
    const { userId } = req.user as { userId: string };
    return this.queryBus.execute(new GetTransactionByIdQuery(id, userId));
  }

  /**
   * Обновляет поля существующей транзакции. Передавать нужно только изменяемые поля.
   * @param id - UUID транзакции.
   * @param dto - Частичные данные для обновления.
   * @param req - Express-запрос; из него извлекается `userId`.
   * @returns Обновлённая транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или не принадлежит пользователю.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить транзакцию', description: 'Частичное обновление — передавайте только изменяемые поля.' })
  @ApiParam({ name: 'id', description: 'UUID транзакции', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Транзакция обновлена', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена' })
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

  /**
   * Удаляет транзакцию по идентификатору.
   * @param id - UUID транзакции.
   * @param req - Express-запрос; из него извлекается `userId`.
   * @returns Удалённая транзакция.
   * @throws {NotFoundException} Если транзакция не найдена или не принадлежит пользователю.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить транзакцию' })
  @ApiParam({ name: 'id', description: 'UUID транзакции', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Транзакция удалена', type: TransactionResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена' })
  async remove(@Param('id') id: string, @Req() req: Request): Promise<Transaction> {
    const { userId } = req.user as { userId: string };
    return this.commandBus.execute(new DeleteTransactionCommand(id, userId));
  }
}
