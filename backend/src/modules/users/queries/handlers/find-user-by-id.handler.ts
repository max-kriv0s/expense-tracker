import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../prisma/prisma.service';
import { FindUserByIdQuery } from '../find-user-by-id.query';
import { User } from '../../../../types';

/**
 * Обработчик запроса поиска пользователя по ID.
 *
 * Используется для получения текущего пользователя по токену
 * и в других местах, где требуется профиль по идентификатору.
 */
@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery> {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * @param query - объект с полем id для поиска
	 * @returns пользователь без поля password или null, если не найден
	 */
	async execute(query: FindUserByIdQuery): Promise<User | null> {
		const { id } = query;
		return this.prisma.user.findUnique({
			where: { id },
			select: { id: true, email: true, name: true, createdAt: true },
		});
	}
}
