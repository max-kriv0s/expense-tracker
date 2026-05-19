import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoriesController } from './categories.controller';
import { CreateCategoryHandler } from './commands/handlers/create-category.handler';
import { UpdateCategoryHandler } from './commands/handlers/update-category.handler';
import { DeleteCategoryHandler } from './commands/handlers/delete-category.handler';
import { GetUserCategoriesHandler } from './queries/handlers/get-user-categories.handler';

const commands = [CreateCategoryHandler, UpdateCategoryHandler, DeleteCategoryHandler];
const queries = [GetUserCategoriesHandler];

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [CategoriesController],
  providers: [PrismaService, ...commands, ...queries],
})
export class CategoriesModule {}
