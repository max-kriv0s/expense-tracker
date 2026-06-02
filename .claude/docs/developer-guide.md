# Гайд для разработчиков

---

## Первый запуск

```bash
# 1. Запустить PostgreSQL
docker-compose up -d

# 2. Настроить бэкенд
cd backend
cp .env.example .env   # или создать .env вручную
npm install
npx prisma migrate dev
npm run dev            # http://localhost:3001/api

# 3. Настроить фронтенд (в отдельном терминале)
cd frontend
npm install
npm run dev            # http://localhost:3000
```

Переменные окружения — см. `README.md` или `docs/architecture.md`.

---

## Добавить новый модуль в бэкенд

Образец — `src/modules/categories/`. Новый модуль создаётся по той же структуре.

### 1. Создать папку модуля

```
src/modules/<name>/
├── <name>.module.ts
├── <name>.controller.ts
├── dto/
│   └── <name>.dto.ts
├── commands/
│   ├── create-<name>.command.ts
│   ├── update-<name>.command.ts
│   ├── delete-<name>.command.ts
│   └── handlers/
│       ├── create-<name>.handler.ts
│       ├── update-<name>.handler.ts
│       └── delete-<name>.handler.ts
└── queries/
    ├── get-<name>s.query.ts
    └── handlers/
        └── get-<name>s.handler.ts
```

### 2. Написать DTO

```typescript
// dto/<name>.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNameDto {
  @ApiProperty({ example: 'значение' })
  @IsString()
  @IsNotEmpty()
  field!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  optionalField?: string;
}
```

### 3. Написать команду и обработчик

```typescript
// commands/create-<name>.command.ts
export class CreateNameCommand {
  constructor(
    public readonly userId: string,
    public readonly field: string,
  ) {}
}

// commands/handlers/create-<name>.handler.ts
@CommandHandler(CreateNameCommand)
export class CreateNameHandler implements ICommandHandler<CreateNameCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateNameCommand): Promise<Name> {
    return this.prisma.name.create({
      data: { field: command.field, userId: command.userId },
    });
  }
}
```

### 4. Написать контроллер

```typescript
@Controller('<name>s')
@UseGuards(JwtAuthGuard)
export class NameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() dto: CreateNameDto, @Request() req: RequestWithUser) {
    return this.commandBus.execute(new CreateNameCommand(req.user.userId, dto.field));
  }
}
```

### 5. Зарегистрировать модуль

```typescript
// <name>.module.ts
@Module({
  imports: [CqrsModule],
  controllers: [NameController],
  providers: [CreateNameHandler, /* другие handlers */],
})
export class NameModule {}
```

Добавить `NameModule` в `imports` в `app.module.ts`.

### 6. Если нужна новая модель в БД

```bash
# Редактировать prisma/schema.prisma, затем:
npx prisma migrate dev --name add-<name>-model
npx prisma generate
```

---

## Добавить новую фичу на фронтенде

Образец — `src/features/auth/`. Структура:

```
src/features/<name>/
├── api/
│   └── <name>Api.ts        # обращения к API
├── model/
│   ├── types.ts            # типы (копия из backend/src/types/index.ts)
│   └── schemas.ts          # Zod-схемы для форм
└── ui/
    └── <Name>Form.tsx      # React-компонент
```

### API-модуль

```typescript
// features/<name>/api/<name>Api.ts
import { apiClient } from '@/shared/api/client';
import type { Name } from '../model/types';

export const nameApi = {
  getAll: (token: string) =>
    apiClient.get<Name[]>('/names', token),

  create: (data: CreateName, token: string) =>
    apiClient.post<Name>('/names', data, token),
};
```

### Компонент с формой

```typescript
// features/<name>/ui/<Name>Form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { nameSchema, type NameFormValues } from '../model/schemas';

export function NameForm({ token }: { token: string }) {
  const form = useForm<NameFormValues>({ resolver: zodResolver(nameSchema) });

  const onSubmit = async (data: NameFormValues) => {
    await nameApi.create(data, token);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### Новая страница

Добавлять только в `app/`, бизнес-логику не писать — импортировать из `features/`:

```typescript
// app/dashboard/<name>/page.tsx
import { NameFeature } from '@/features/<name>/ui/NameFeature';
export default function NamePage() {
  return <NameFeature />;
}
```

### Новые shadcn/ui компоненты

Размещать в `src/shared/ui/`. Копировать из `shadcn/ui` репозитория и адаптировать под Tailwind v4.

---

## Синхронизация типов между бэкендом и фронтендом

Общие типы живут в `backend/src/types/index.ts`. На фронтенде их копия — в `src/entities/<entity>/model/types.ts`.

При изменении типов в бэкенде — обновить соответствующие файлы на фронтенде вручную.

```bash
# Проверить расхождение
diff backend/src/types/index.ts frontend/src/entities/transaction/model/types.ts
```

---

## Добавить миграцию БД

```bash
cd backend

# Создать и применить миграцию в dev-режиме
npx prisma migrate dev --name <описание-изменения>

# Пересгенерировать клиент (делается автоматически после migrate dev, но можно вручную)
npx prisma generate
```

Файлы миграций коммитить вместе с изменениями схемы.

---

## Git workflow

Проект использует **GitHub Flow**. Работа ведётся только через ветки — прямые коммиты в `main` запрещены.

```bash
# Начало работы над фичей
git checkout main && git pull
git checkout -b feature/<name>

# В процессе: держать ветку актуальной
git fetch origin && git rebase origin/main

# Завершение
git push -u origin feature/<name>
# → создать PR на GitHub → code review → merge → удалить ветку
```

### Именование веток

| Тип | Пример |
|-----|--------|
| Новая фича | `feature/transactions-filter` |
| Баг | `fix/refresh-token-expired` |
| Инфраструктура | `chore/update-prisma` |

### Формат коммитов (Conventional Commits)

```
<type>(<scope>): <description>
```

**type:** `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`
**scope:** `auth`, `expenses`, `categories`, `transactions`, `backend`, `frontend`, `db`, `api`, `ui`

Примеры:
```
feat(transactions): add date range filter
fix(auth): handle expired refresh token
chore(db): add index on transactions.userId
```

- Описание на **английском** в повелительном наклонении.
- Без заглавной буквы в начале и точки в конце.
- Не создавать коммит без явного согласия — показать изменения, дождаться одобрения.

---

## Swagger и JSDoc

После добавления/изменения эндпоинтов:

1. Добавить `@ApiProperty` / `@ApiPropertyOptional` на все поля DTO.
2. Добавить `@ApiOperation`, `@ApiResponse` на методы контроллера.
3. Добавить JSDoc-комментарий на handler (`execute`) с описанием логики.

Проверить результат: `http://localhost:3001/api/docs`.

---

## Типичные ошибки и решения

### `PrismaClientKnownRequestError: P2003` (FK constraint)
Попытка удалить запись, на которую ссылаются другие. Например, удалить категорию с привязанными транзакциями. Решение: сначала удалить или перепривязать транзакции.

### `Decimal` вместо `number` в ответе
Prisma возвращает поле `amount` как объект `Decimal`. Привести: `parseFloat(row.amount.toString())`.

### `401` на фронтенде после долгого бездействия
`access_token` истёк (60 мин). Фронтенд должен вызвать `POST /api/users/login` с `refresh_token` и записать новую пару токенов в `localStorage`.

### TypeScript: `emitDecoratorMetadata` / `experimentalDecorators`
NestJS требует обоих флагов в `tsconfig.json`. Без них DI не работает.

### Tailwind v4: CSS-переменные вместо конфига
В этом проекте Tailwind v4 настраивается через CSS-переменные в `app/globals.css` (`@theme { --color-* }`), а не через `tailwind.config.js`. Добавлять новые токены туда.
