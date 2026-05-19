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
