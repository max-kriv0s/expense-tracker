import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateCategoryCommand } from './commands/create-category.command';
import { UpdateCategoryCommand } from './commands/update-category.command';
import { DeleteCategoryCommand } from './commands/delete-category.command';
import { GetUserCategoriesQuery } from './queries/get-user-categories.query';
import { Category } from '../../types';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateCategoryDto, @Req() req: Request): Promise<Category> {
    const { userId } = req.user as { userId: string };
    return this.commandBus.execute(
      new CreateCategoryCommand(dto.name, userId, dto.icon, dto.color),
    );
  }

  @Get()
  async findAll(@Req() req: Request): Promise<Category[]> {
    const { userId } = req.user as { userId: string };
    return this.queryBus.execute(new GetUserCategoriesQuery(userId));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req: Request,
  ): Promise<Category> {
    const { userId } = req.user as { userId: string };
    return this.commandBus.execute(
      new UpdateCategoryCommand(id, userId, dto.name, dto.icon, dto.color),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<Category> {
    const { userId } = req.user as { userId: string };
    return this.commandBus.execute(new DeleteCategoryCommand(id, userId));
  }
}
