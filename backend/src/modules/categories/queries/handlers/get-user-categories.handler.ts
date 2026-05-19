import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetUserCategoriesQuery } from '../get-user-categories.query';
import { Category } from '../../../../types';

@QueryHandler(GetUserCategoriesQuery)
export class GetUserCategoriesHandler implements IQueryHandler<GetUserCategoriesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserCategoriesQuery): Promise<Category[]> {
    return this.prisma.category.findMany({ where: { userId: query.userId } });
  }
}
