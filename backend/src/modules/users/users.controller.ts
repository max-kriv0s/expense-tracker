import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';
import { CreateUserCommand } from './commands/create-user.command';
import { LoginCommand } from '../auth/commands/login.command';
import { GetCurrentUserQuery } from '../auth/queries/get-current-user.query';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, AuthTokens } from '../../types';

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<User> {
    return this.commandBus.execute(
      new CreateUserCommand(dto.email, dto.name, dto.password),
    );
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<AuthTokens> {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request): Promise<User> {
    const user = req.user as { userId: string };
    return this.queryBus.execute(new GetCurrentUserQuery(user.userId));
  }
}
