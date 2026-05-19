import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { FindUserByEmailQuery } from '../find-user-by-email.query';

@QueryHandler(FindUserByEmailQuery)
export class FindUserByEmailHandler implements IQueryHandler<FindUserByEmailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: FindUserByEmailQuery) {
    const { email } = query;
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, createdAt: true },
    });
  }
}
