import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginHandler } from './commands/handlers/login.handler';
import { RefreshTokenHandler } from './commands/handlers/refresh-token.handler';
import { GetCurrentUserHandler } from './queries/handlers/get-current-user.handler';
import { JwtStrategy } from '../../common/jwt.strategy';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

const commands = [LoginHandler, RefreshTokenHandler];
const queries = [GetCurrentUserHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [PrismaService, ...commands, ...queries, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
