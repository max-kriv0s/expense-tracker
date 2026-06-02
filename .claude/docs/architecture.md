# Архитектура проекта

## Обзор

Expense Tracker состоит из двух полностью независимых приложений, разделённых по папкам:

```
expense-tracker/
├── backend/    — REST API (NestJS + Prisma + PostgreSQL)
└── frontend/   — Веб-клиент (Next.js + React)
```

Общение между ними — исключительно через HTTP (JSON REST API). Никакого общего кода, сборки или npm workspace нет.

---

## Backend

### Технологии

| Технология | Версия | Роль |
|-----------|--------|------|
| NestJS | 11 | Фреймворк |
| @nestjs/cqrs | 11 | CQRS-паттерн |
| Prisma ORM | 5 | Работа с БД |
| PostgreSQL | 16 | База данных |
| @nestjs/jwt + passport-jwt | — | JWT-аутентификация |
| argon2 | — | Хэширование паролей |
| class-validator / class-transformer | — | Валидация DTO |
| zod | 3 | Общие типы (shared с фронтендом) |
| @nestjs/swagger | 11 | Документация API |

### Структура модулей

```
src/
├── app.module.ts
├── main.ts                     # Bootstrap: CORS, ValidationPipe, Swagger, порт
├── common/
│   ├── guards/jwt-auth.guard.ts   # Защищает маршруты через Passport JWT
│   └── jwt.strategy.ts            # Извлекает userId/email/name из токена
├── modules/
│   ├── auth/                   # Аутентификация
│   │   ├── commands/           # login, refresh-token
│   │   └── queries/            # get-current-user
│   ├── users/                  # Пользователи
│   │   ├── commands/           # create-user (регистрация)
│   │   └── queries/            # find-by-email, find-by-id
│   ├── categories/             # Категории транзакций
│   │   ├── commands/           # create, update, delete
│   │   ├── queries/            # get-user-categories
│   │   └── dto/
│   └── transactions/           # Транзакции
│       ├── commands/           # create, update, delete
│       ├── queries/            # get-list, get-by-id, get-summary
│       └── dto/
├── prisma/
│   └── prisma.service.ts       # Singleton-обёртка над PrismaClient
└── types/
    └── index.ts                # Общие Zod-схемы и TypeScript-типы
```

### CQRS-паттерн

Все бизнес-операции разделены на команды (изменяют состояние) и запросы (читают данные).

**Команда** — операция записи:
```
commands/
├── <action>.command.ts           — класс с данными команды (payload)
└── handlers/<action>.handler.ts  — реализует ICommandHandler<TCommand>
```

**Запрос** — операция чтения:
```
queries/
├── <action>.query.ts             — класс с параметрами запроса
└── handlers/<action>.handler.ts  — реализует IQueryHandler<TQuery>
```

Контроллер диспетчирует через `CommandBus` и `QueryBus`, не содержит бизнес-логики.

### JWT-аутентификация

- Алгоритм: HS256, секрет из `JWT_SECRET`.
- `access_token` живёт **60 минут**.
- `refresh_token` живёт **7 дней**.
- Payload токена: `{ sub: userId, email, name }`.
- Защищённые маршруты обёрнуты декоратором `@UseGuards(JwtAuthGuard)`.
- `JwtStrategy` кладёт `{ userId, email, name }` в `request.user`.

### Глобальные настройки

- Префикс всех маршрутов: `/api`
- Порт: `3001` (переменная `PORT`)
- CORS: включён для всех источников (`app.enableCors()`)
- Валидация: `ValidationPipe({ whitelist: true, transform: true })` — неизвестные поля отрезаются, типы приводятся автоматически

---

## Frontend

### Технологии

| Технология | Версия | Роль |
|-----------|--------|------|
| Next.js | 16.2.6 | Фреймворк (App Router) |
| React | 19 | UI |
| Tailwind CSS | 4 | Стили |
| shadcn/ui | — | UI-компоненты (написаны вручную в `shared/ui/`) |
| react-hook-form | 7 | Формы |
| zod | 3 | Валидация форм |
| lucide-react | — | Иконки |

### Архитектура: Feature Slice Design (FSD)

FSD делит код на слои с однонаправленными зависимостями:

```
app/ (Next.js App Router — только маршруты)
src/
├── widgets/    — составные блоки из нескольких фич (DashboardSidebar)
├── features/   — бизнес-фичи: auth, transactions, categories
├── entities/   — доменные типы: user, transaction, category
└── shared/     — переиспользуемое: API-клиент, утилиты, shadcn-компоненты
```

**Правило импортов:** слои импортируют только слои ниже по списку:
`widgets → features → entities → shared`

Кросс-импорты внутри одного слоя (например, `features/auth` → `features/transactions`) **запрещены**.

### Маршрутизация (App Router)

```
app/
├── page.tsx                  — редирект на /login
├── (auth)/
│   ├── layout.tsx            — центрированный layout
│   ├── login/page.tsx
│   └── register/page.tsx
└── dashboard/
    ├── layout.tsx            — layout с sidebar
    ├── page.tsx              — список транзакций + сводка
    └── categories/page.tsx   — управление категориями
```

`app/` содержит только маршруты и layout-компоненты. Вся бизнес-логика вынесена в `features/`.

### Аутентификация на фронтенде

- Токены хранятся в `localStorage`: ключи `access_token` и `refresh_token`.
- Хук `useAuth()` (`features/auth/model/useAuth.ts`) читает `access_token` при монтировании; если токена нет — делает `router.replace('/login')`.
- Базовый клиент (`shared/api/client.ts`) принимает токен явно — каждый API-модуль достаёт его из `localStorage` и передаёт.
- При получении `401` фронтенд вызывает `POST /api/users/login` с `refresh_token` для обновления пары токенов.

### API-клиент (`shared/api/client.ts`)

Тонкая обёртка над нативным `fetch`. Поддерживает методы `get` и `post`. При не-`2xx` ответе выбрасывает `ApiError(status, message)`. Базовый URL берётся из `NEXT_PUBLIC_API_URL`.

---

## Общие типы

Файл `backend/src/types/index.ts` содержит Zod-схемы и TypeScript-типы, которые используются в обоих приложениях:

`User`, `RegisterUser`, `LoginUser`, `AuthTokens`, `Category`, `CreateCategory`, `UpdateCategory`, `Transaction`, `TransactionType`, `TransactionSummary`.

На фронтенде эти типы **копируются** в `src/entities/<entity>/model/types.ts` — общего пакета нет, синхронизация ручная.

---

## Инфраструктура

### Docker Compose

Поднимает только PostgreSQL:

```yaml
image: postgres:16-alpine
container_name: expense-tracker-db
ports: 5432:5432
credentials: user / password / expense_tracker
volumes: ./postgres_data
```

Бэкенд и фронтенд запускаются локально через `npm run dev`.

### Порты по умолчанию

| Сервис | Порт |
|--------|------|
| PostgreSQL | 5432 |
| Backend API | 3001 |
| Frontend | 3000 |
