# План реализации модуля авторизации с CQRS

## Контекст
Необходимо добавить систему авторизации через JWT в NestJS бэкенд с Prisma. Пользователь хранится в PostgreSQL, пароль должен хэшироваться с помощью Argon2. Для работы с пользователями использовать паттерн CQRS (Command Query Responsibility Segregation).

## Архитектура (CQRS)

### Command (Write Operations)
- **CreateUserCommand** - создание нового пользователя с хэшированием пароля через Argon2
- **LoginCommand** - аутентификация и генерация access + refresh токенов
- **RefreshTokenCommand** - обновление токена по refresh токену

### Query (Read Operations)
- **FindUserByEmailQuery** - поиск пользователя по email (для регистрации)
- **FindUserByIdQuery** - поиск пользователя по id (для аутентификации)
- **GetCurrentUserQuery** - получение текущего пользователя из токена

## Изменения

### 1. Обновление Prisma схемы (`apps/backend/prisma/schema.prisma`)
Добавить поле `password` (хэш пароля) в модель User:
```prisma
password   String   @omit
```

### 2. Обновление shared-types (`packages/shared-types/src/index.ts`)
Добавить схемы для авторизации:
- `RegisterUserSchema` - email, name, password
- `LoginUserSchema` - email, password
- `AuthTokensSchema` - access_token, refresh_token

### 3. Создание модуля users (`apps/backend/src/modules/users/`)
**Структура (CQRS):**
- `commands/` - команды (write operations)
  - `handlers/create-user.handler.ts` - обработчик создания пользователя
  - `create-user.command.ts` - команда создания
- `queries/` - запросы (read operations)
  - `handlers/find-user-by-email.handler.ts` - поиск по email
  - `handlers/find-user-by-id.handler.ts` - поиск по id
  - `find-user-by-email.query.ts` - запрос
  - `find-user-by-id.query.ts` - запрос
- `dto/` - data transfer objects
- `users.controller.ts` - endpoints `/register` и `/login`
- `users.service.ts` - оркестрация через CQRS команды/запросы
- `users.module.ts` - экспорт модуля

### 4. Создание модуля auth (`apps/backend/src/modules/auth/`)
**Структура:**
- `commands/` - команды авторизации
  - `handlers/login.handler.ts` - обработчик входа
  - `handlers/refresh-token.handler.ts` - обработчик обновления токена
  - `login.command.ts` - команда входа
  - `refresh-token.command.ts` - команда обновления
- `queries/` - запросы
  - `handlers/get-current-user.handler.ts` - получение текущего пользователя
  - `get-current-user.query.ts` - запрос
- `jwt/` - настройки JWT
  - `jwt.strategy.ts` - стратегия аутентификации NestJS
  - `jwt.guard.ts` - guard для защиты endpoint'ов
- `auth.controller.ts` - endpoints для авторизации
- `auth.service.ts` - генерация/проверка JWT токенов
- `auth.module.ts` - экспорт модуля

### 5. Создание common guards/filters (`apps/backend/src/common/`)
- `guards/jwt-auth.guard.ts` - защита endpoint'ов требующих авторизации
- `filters/exception.filter.ts` - глобальный фильтр исключений

### 6. Обновление main.ts
Регистрация JWT модуля и настройка глобального префикса `/api`

## Зависимости
Необходимо добавить в `apps/backend/package.json`:
- `argon2` - для хэширования пароля
- `@nestjs/jwt` - для работы с JWT
- `@nestjs/passport` - для интеграции passport
- `@nestjs/cqrs` - для реализации паттерна CQRS
- `passport-jwt` - стратегия JWT
- `passport` - библиотека passport

## Verification
1. Запустить бэкенд: `npm run dev` (в apps/backend)
2. Выполнить миграцию: `npx prisma migrate dev`
3. Протестировать:
   - POST `/api/users/register` - создание пользователя
   - POST `/api/users/login` - вход и получение токена
   - GET `/api/users/me` (с токеном) - получение текущего пользователя
