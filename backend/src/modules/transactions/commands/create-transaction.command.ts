/**
 * Команда создания новой транзакции.
 * @param userId - Идентификатор владельца транзакции.
 * @param amount - Сумма транзакции (положительное число).
 * @param type - Тип: `INCOME` или `EXPENSE`.
 * @param date - Дата транзакции в формате ISO 8601.
 * @param categoryId - Идентификатор категории.
 * @param description - Опциональное описание.
 */
export class CreateTransactionCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly type: string,
    public readonly date: string,
    public readonly categoryId: string,
    public readonly description?: string,
  ) {}
}
