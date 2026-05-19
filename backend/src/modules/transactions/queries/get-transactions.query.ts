export class GetTransactionsQuery {
  constructor(
    public readonly userId: string,
    public readonly dateFrom?: string,
    public readonly dateTo?: string,
    public readonly type?: string,
    public readonly categoryId?: string,
  ) {}
}
