/**
 * Команда удаления транзакции.
 * @param id - UUID транзакции.
 * @param userId - Идентификатор владельца (для проверки прав).
 */
export class DeleteTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
