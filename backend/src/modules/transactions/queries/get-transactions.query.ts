/**
 * Запрос списка транзакций пользователя с опциональными фильтрами.
 * @param userId - Идентификатор пользователя.
 * @param dateFrom - Начало диапазона дат в формате ISO 8601 (опционально).
 * @param dateTo - Конец диапазона дат в формате ISO 8601 (опционально).
 * @param type - Фильтр по типу: `INCOME` или `EXPENSE` (опционально).
 * @param categoryId - Фильтр по категории (опционально).
 */
export class GetTransactionsQuery {
  constructor(
    public readonly userId: string,
    public readonly dateFrom?: string,
    public readonly dateTo?: string,
    public readonly type?: string,
    public readonly categoryId?: string,
  ) {}
}
