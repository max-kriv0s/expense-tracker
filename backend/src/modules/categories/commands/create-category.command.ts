export class CreateCategoryCommand {
  constructor(
    public readonly name: string,
    public readonly userId: string,
    public readonly icon?: string,
    public readonly color?: string,
  ) {}
}
