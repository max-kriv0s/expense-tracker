import { Test, TestingModule } from '@nestjs/testing';
import { FindUserByIdHandler } from './find-user-by-id.handler';
import { PrismaService } from '../../../../prisma/prisma.service';
import { FindUserByIdQuery } from '../find-user-by-id.query';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
};

describe('FindUserByIdHandler', () => {
  let handler: FindUserByIdHandler;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByIdHandler,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    handler = module.get(FindUserByIdHandler);
  });

  it('должен быть определён', () => {
    expect(handler).toBeDefined();
  });

  it('должен вернуть пользователя по id', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await handler.execute(new FindUserByIdQuery('user-1'));

    expect(result).toEqual(mockUser);
  });

  it('должен вернуть null, если пользователь не найден', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await handler.execute(new FindUserByIdQuery('unknown-id'));

    expect(result).toBeNull();
  });

  it('должен запрашивать только поля id, email, name, createdAt', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await handler.execute(new FindUserByIdQuery('user-1'));

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  });
});
