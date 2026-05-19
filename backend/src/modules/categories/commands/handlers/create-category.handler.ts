import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCategoryCommand } from '../create-category.command';
import { Category } from '../../../../types';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateCategoryCommand): Promise<Category> {
    const { name, icon, color, userId } = command;
    return this.prisma.category.create({
      data: { name, icon, color, userId },
    });
  }
}
