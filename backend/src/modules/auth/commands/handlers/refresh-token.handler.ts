import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RefreshTokenCommand } from '../refresh-token.command';
import { AuthTokens } from '../../../../types';
import { JwtService } from '@nestjs/jwt';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthTokens> {
    const { refreshToken } = command;

    let payload: { sub: string; email: string; name: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Невалидный refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const newPayload = { sub: user.id, email: user.email, name: user.name };

    return {
      access_token: this.jwtService.sign(newPayload, { expiresIn: '60m' }),
      refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
    };
  }
}
