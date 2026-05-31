## Architecture

NestJS приложение с Prisma ORM и PostgreSQL.

### Структура модулей

```
src/
├── app.module.ts
├── main.ts
├── common/                     # Переиспользуемое (guards, strategy)
│   ├── guards/jwt-auth.guard.ts
│   └── jwt.strategy.ts
├── modules/
│   ├── auth/                   # JWT-авторизация (CQRS)
│   │   ├── commands/           # login, refresh-token
│   │   └── queries/            # get-current-user
│   ├── users/                  # Управление пользователями (CQRS)
│   │   ├── commands/           # create-user
│   │   └── queries/            # find-user-by-email, find-user-by-id
│   ├── categories/             # Категории транзакций (CQRS)
│   │   ├── commands/           # create, update, delete
│   │   ├── queries/            # get-user-categories
│   │   └── dto/
│   └── transactions/           # Транзакции (CQRS)
│       ├── commands/           # create, update, delete
│       ├── queries/            # get-transactions, get-by-id, get-summary
│       └── dto/
├── prisma/
│   └── prisma.service.ts
└── types/
    └── index.ts                # Общие типы (zod-схемы + TypeScript-типы)
```

### CQRS-паттерн

Все модули используют `@nestjs/cqrs`. Конвенция:

- `commands/<action>.command.ts` — DTO команды
- `commands/handlers/<action>.handler.ts` — обработчик (реализует `ICommandHandler`)
- `queries/<action>.query.ts` — DTO запроса
- `queries/handlers/<action>.handler.ts` — обработчик (реализует `IQueryHandler`)

### Модели данных (Prisma)

```
User          — id, email, name, password, createdAt
Category      — id, name, icon?, color?, userId
Transaction   — id, amount, type (INCOME|EXPENSE), description?, date, categoryId, userId, createdAt
Expense       — id, amount, description, date, userId, categoryId  (legacy, не используется на фронтенде)
```

### Общие типы (`src/types/index.ts`)

Zod-схемы и TypeScript-типы, используемые в обоих приложениях:
`User`, `RegisterUser`, `LoginUser`, `AuthTokens`, `Category`, `CreateCategory`, `UpdateCategory`, `Transaction`, `TransactionType`, `TransactionSummary`.

## Commands

- Dev-режим: `npm run dev`
- Сборка: `npm run build`
- Prisma миграция: `npx prisma migrate dev`
- Prisma клиент: `npx prisma generate`

## Development Guidelines

- Типы, используемые в обоих приложениях, поддерживать в `src/types/index.ts`.
- NestJS `tsconfig.json` обязательно должен содержать `emitDecoratorMetadata: true` и `experimentalDecorators: true`.
- JWT-секрет задаётся через переменную окружения `JWT_SECRET`.
- БД — через переменную окружения `DATABASE_URL`.
- API доступно по префиксу `/api`.
- Порт по умолчанию: **3001**.
- Новый модуль создавать по образцу `src/modules/categories/` (CQRS, DTO, controller, module).
