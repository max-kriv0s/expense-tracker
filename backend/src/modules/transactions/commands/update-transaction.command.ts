/**
 * Команда частичного обновления транзакции.
 * @param id - UUID транзакции.
 * @param userId - Идентификатор владельца (для проверки прав).
 * @param amount - Новая сумма (опционально).
 * @param type - Новый тип: `INCOME` или `EXPENSE` (опционально).
 * @param date - Новая дата в формате ISO 8601 (опционально).
 * @param categoryId - Новая категория (опционально).
 * @param description - Новое описание (опционально).
 */
export class UpdateTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount?: number,
    public readonly type?: string,
    public readonly date?: string,
    public readonly categoryId?: string,
    public readonly description?: string,
  ) {}
}
