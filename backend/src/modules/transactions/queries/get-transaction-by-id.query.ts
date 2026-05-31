/**
 * Запрос одной транзакции по идентификатору.
 * @param id - UUID транзакции.
 * @param userId - Идентификатор владельца (для проверки прав).
 */
export class GetTransactionByIdQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
