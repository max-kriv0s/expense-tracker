import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** NestJS-обёртка над PrismaClient. Управляет подключением в рамках жизненного цикла модуля. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Устанавливает соединение с БД при инициализации модуля.
   * @returns Promise, который разрешается после успешного подключения.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Закрывает соединение с БД при уничтожении модуля.
   * @returns Promise, который разрешается после отключения.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
