import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetCurrentUserQuery } from '../get-current-user.query';
import { User } from '../../../../types';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCurrentUserQuery): Promise<User | null> {
    const { userId } = query;
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }
}
