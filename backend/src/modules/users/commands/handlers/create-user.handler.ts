import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateUserCommand } from '../create-user.command';
import { User } from '../../../../types';
import * as argon2 from 'argon2';

/**
 * Обработчик команды создания нового пользователя.
 *
 * Проверяет уникальность email, хэширует пароль через argon2
 * и сохраняет пользователя в БД.
 */
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @param command - данные нового пользователя (email, name, password)
   * @returns созданный пользователь без поля password
   * @throws {ConflictException} если пользователь с таким email уже существует
   */
  async execute(command: CreateUserCommand): Promise<User> {
    const { email, name, password } = command;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await argon2.hash(password);

    return this.prisma.user.create({
      data: { email, name, password: hashedPassword },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }
}
