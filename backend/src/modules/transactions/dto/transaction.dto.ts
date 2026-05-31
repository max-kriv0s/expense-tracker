import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Допустимые типы транзакции. */
export enum TransactionTypeEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

/** Схема ответа: одна транзакция. */
export class TransactionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...', description: 'UUID транзакции' })
  id!: string;

  @ApiProperty({ example: 1500.5 })
  amount!: number;

  @ApiProperty({ enum: TransactionTypeEnum })
  type!: TransactionTypeEnum;

  @ApiPropertyOptional({ example: 'Продукты', nullable: true })
  description!: string | null;

  @ApiProperty({ example: '2025-05-31T00:00:00.000Z' })
  date!: Date;

  @ApiProperty({ example: 'uuid-категории' })
  categoryId!: string;

  @ApiProperty({ example: 'uuid-пользователя' })
  userId!: string;

  @ApiProperty({ example: '2025-05-31T12:00:00.000Z' })
  createdAt!: Date;
}

/** Схема ответа: сводка транзакций за месяц. */
export class TransactionSummaryResponseDto {
  @ApiProperty({ example: 50000 })
  totalIncome!: number;

  @ApiProperty({ example: 32000 })
  totalExpense!: number;

  @ApiProperty({ example: 18000 })
  balance!: number;
}

/** DTO для создания новой транзакции. */
export class CreateTransactionDto {
  @ApiProperty({ example: 1500.5, description: 'Сумма транзакции (положительное число)' })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ enum: TransactionTypeEnum, example: TransactionTypeEnum.EXPENSE, description: 'Тип транзакции' })
  @IsEnum(TransactionTypeEnum)
  type!: TransactionTypeEnum;

  @ApiPropertyOptional({ example: 'Продукты в магазине', description: 'Описание транзакции' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-05-31', description: 'Дата транзакции в формате ISO 8601' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 'uuid-категории', description: 'Идентификатор категории' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}

/** DTO для частичного обновления транзакции. Все поля опциональны. */
export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 2000, description: 'Новая сумма транзакции' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ enum: TransactionTypeEnum, example: TransactionTypeEnum.INCOME, description: 'Новый тип транзакции' })
  @IsEnum(TransactionTypeEnum)
  @IsOptional()
  type?: TransactionTypeEnum;

  @ApiPropertyOptional({ example: 'Зарплата', description: 'Новое описание' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2025-06-01', description: 'Новая дата в формате ISO 8601' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: 'uuid-категории', description: 'Новый идентификатор категории' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}

/** Query-параметры для фильтрации списка транзакций. Все поля опциональны. */
export class GetTransactionsQueryDto {
  @ApiPropertyOptional({ example: '2025-05-01', description: 'Начало диапазона дат (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2025-05-31', description: 'Конец диапазона дат (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ enum: TransactionTypeEnum, description: 'Фильтр по типу транзакции' })
  @IsEnum(TransactionTypeEnum)
  @IsOptional()
  type?: TransactionTypeEnum;

  @ApiPropertyOptional({ example: 'uuid-категории', description: 'Фильтр по категории' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}

/** Query-параметры для запроса месячной сводки транзакций. */
export class GetSummaryQueryDto {
  @ApiProperty({ example: 5, description: 'Месяц (1–12)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ example: 2025, description: 'Год (2000–2100)' })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;
}
