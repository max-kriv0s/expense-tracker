import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersController } from './users.controller';
import { CreateUserHandler } from './commands/handlers/create-user.handler';
import { FindUserByEmailHandler } from './queries/handlers/find-user-by-email.handler';
import { FindUserByIdHandler } from './queries/handlers/find-user-by-id.handler';

const commands = [CreateUserHandler];
const queries = [FindUserByEmailHandler, FindUserByIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [PrismaService, ...commands, ...queries],
})
export class UsersModule {}
