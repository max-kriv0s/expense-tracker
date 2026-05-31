/**
 * Запрос месячной сводки транзакций (доходы, расходы, баланс).
 * @param userId - Идентификатор пользователя.
 * @param month - Месяц в диапазоне 1–12.
 * @param year - Год в диапазоне 2000–2100.
 */
export class GetTransactionsSummaryQuery {
  constructor(
    public readonly userId: string,
    public readonly month: number,
    public readonly year: number,
  ) {}
}
