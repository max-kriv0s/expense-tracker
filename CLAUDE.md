# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Expense Tracker — два независимых приложения: бэкенд и фронтенд.

### Architecture
- `backend/`: NestJS приложение с Prisma ORM и PostgreSQL. Паттерн CQRS для работы с пользователями и авторизацией.
- `frontend/`: Next.js (v16.2.6) приложение с React 19 и Tailwind CSS v4. Архитектура — Feature Slice Design (FSD). UI компоненты — shadcn/ui.
- Общие типы находятся в `backend/src/types/index.ts`. При необходимости использовать на фронтенде — копировать в `frontend/src/entities/<entity>/model/types.ts`.

## Common Commands
### Backend (`backend/`)
- Запуск в dev-режиме: `npm run dev`
- Сборка: `npm run build`
- Prisma миграция: `npx prisma migrate dev`
- Генерация Prisma клиента: `npx prisma generate`

### Frontend (`frontend/`)
- Запуск в dev-режиме: `npm run dev`
- Сборка: `npm run build`

### Infrastructure
- Запуск БД: `docker-compose up -d`
- Образ: `postgres:16-alpine`
- Данные: `./postgres_data`

## Frontend Architecture — Feature Slice Design (FSD)

Фронтенд следует архитектуре Feature Slice Design. Код организован в слои:

```
frontend/
├── app/                        # Next.js App Router (только маршрутизация)
│   ├── (auth)/                 # Route group для страниц авторизации
│   │   ├── layout.tsx          # Центрированный layout для auth-страниц
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Редирект на /login
└── src/
    ├── features/               # Бизнес-фичи (auth, expenses, etc.)
    │   └── auth/
    │       ├── api/            # Вызовы API (authApi.ts)
    │       ├── model/          # Схемы zod, типы форм
    │       └── ui/             # React-компоненты фичи (LoginForm, RegisterForm)
    ├── entities/               # Доменные сущности
    │   └── user/
    │       └── model/types.ts  # User, AuthTokens
    └── shared/                 # Переиспользуемое между слоями
        ├── api/client.ts       # Базовый fetch-клиент
        ├── lib/utils.ts        # Утилиты (cn)
        └── ui/                 # shadcn/ui компоненты (Button, Input, Label, Card)
```

### FSD правила
- Импорты идут только вниз по слоям: `features` → `entities` → `shared`.
- Внутри слоя — кросс-импорты запрещены (features не импортируют другие features).
- Алиасы tsconfig: `@/features/*`, `@/entities/*`, `@/shared/*`.
- Новые shadcn компоненты добавлять в `src/shared/ui/`.
- Новые фичи (expenses, categories) создавать по образцу `src/features/auth/`.

### UI компоненты
- Библиотека: shadcn/ui (компоненты написаны вручную в `src/shared/ui/`)
- Стили: Tailwind CSS v4 с CSS-переменными в `app/globals.css` (`@theme { --color-* }`)
- Формы: react-hook-form + zod (схемы в `features/<name>/model/schemas.ts`)
- Токены хранятся в `localStorage` (`access_token`, `refresh_token`)

## Git Commit Convention

Используем **Conventional Commits**. Формат: `<type>(<scope>): <description>`

### Типы (type)
- `feat` — новая функциональность
- `fix` — исправление бага
- `refactor` — рефакторинг без изменения поведения
- `style` — форматирование, отступы (без изменения логики)
- `test` — тесты
- `docs` — документация
- `chore` — инфраструктура, зависимости, конфиги

### Области (scope)
- `auth`, `expenses`, `categories` — фичи
- `backend`, `frontend` — приложения в целом
- `db`, `api`, `ui` — технические слои

### Примеры
```
feat(auth): add JWT refresh token rotation
fix(expenses): handle empty category on create
chore(db): add postgres docker-compose config
docs: update CLAUDE.md with commit convention
```

### Правила
- Описание на **английском языке**, в повелительном наклонении («add», «fix», «remove»).
- Не использовать заглавную букву в начале и точку в конце.
- Если коммит закрывает задачу, добавить `Closes #N` в тело коммита.

## Development Guidelines
- Типы, используемые в обоих приложениях, поддерживать в `backend/src/types/index.ts`.
- NestJS tsconfig обязательно должен содержать `emitDecoratorMetadata: true` и `experimentalDecorators: true`.
- JWT секрет задаётся через переменную окружения `JWT_SECRET`.
- API доступно по префиксу `/api`.
- URL бэкенда на фронтенде задаётся через `NEXT_PUBLIC_API_URL` (по умолчанию `http://localhost:3001/api`).
- Бэкенд по умолчанию запускается на порту **3001** (фронтенд занимает 3000).
