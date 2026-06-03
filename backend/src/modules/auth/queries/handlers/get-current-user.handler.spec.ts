import { Test, TestingModule } from '@nestjs/testing';
import { GetCurrentUserHandler } from './get-current-user.handler';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetCurrentUserQuery } from '../get-current-user.query';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
};

describe('GetCurrentUserHandler', () => {
  let handler: GetCurrentUserHandler;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentUserHandler,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    handler = module.get(GetCurrentUserHandler);
  });

  it('должен быть определён', () => {
    expect(handler).toBeDefined();
  });

  it('должен вернуть пользователя по userId', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await handler.execute(new GetCurrentUserQuery('user-1'));

    expect(result).toEqual(mockUser);
  });

  it('должен вернуть null, если пользователь не найден', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await handler.execute(new GetCurrentUserQuery('unknown-id'));

    expect(result).toBeNull();
  });

  it('должен запрашивать только поля id, email, name, createdAt', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await handler.execute(new GetCurrentUserQuery('user-1'));

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  });
});
