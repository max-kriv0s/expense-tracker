import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { FindUserByEmailQuery } from '../find-user-by-email.query';

/**
 * Обработчик запроса поиска пользователя по email.
 *
 * Используется в процессе аутентификации — возвращает пользователя
 * включая хэш пароля для последующей проверки.
 */
@QueryHandler(FindUserByEmailQuery)
export class FindUserByEmailHandler implements IQueryHandler<FindUserByEmailQuery> {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * @param query - объект с полем email для поиска
	 * @returns пользователь с хэшем пароля или null, если не найден
	 */
	async execute(query: FindUserByEmailQuery) {
		const { email } = query;
		return this.prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true, name: true, password: true, createdAt: true },
		});
	}
}
