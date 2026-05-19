import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateCategoryCommand } from '../update-category.command';
import { Category } from '../../../../types';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateCategoryCommand): Promise<Category> {
    const { id, userId, name, icon, color } = command;

    const category = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return this.prisma.category.update({
      where: { id },
      data: { name, icon, color },
    });
  }
}
