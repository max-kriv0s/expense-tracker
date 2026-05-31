# Expense Tracker

Приложение для управления личными финансами. Состоит из двух независимых сервисов: REST API на NestJS и веб-клиента на Next.js.

## Стек

| Слой | Технологии |
|------|-----------|
| Backend | NestJS 11, Prisma ORM, PostgreSQL 16, JWT (access + refresh), CQRS, Zod, Swagger |
| Frontend | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, react-hook-form, Zod |
| Инфраструктура | Docker Compose (PostgreSQL) |

## Требования

- Node.js 20+
- Docker и Docker Compose
- npm

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd expense-tracker
```

### 2. Запустить базу данных

```bash
docker-compose up -d
```

PostgreSQL будет доступен на `localhost:5432`.

### 3. Настроить бэкенд

```bash
cd backend
cp .env.example .env   # или создать .env вручную (см. раздел ниже)
npm install
npx prisma migrate dev
npm run dev
```

API запустится на `http://localhost:3001/api`.
Swagger UI: `http://localhost:3001/api/docs`.

### 4. Настроить фронтенд

```bash
cd frontend
cp .env.example .env.local   # или создать .env.local вручную (см. раздел ниже)
npm install
npm run dev
```

Клиент запустится на `http://localhost:3000`.

---

## Переменные окружения

### Backend — `backend/.env`

```env
# Строка подключения к PostgreSQL
# Совпадает с параметрами docker-compose.yml по умолчанию
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"

# Секрет для подписи JWT-токенов — замените на случайную строку в продакшене
JWT_SECRET="your-secret-key"

# Порт (необязательно, по умолчанию 3001)
PORT=3001
```

### Frontend — `frontend/.env.local`

```env
# Базовый URL бэкенда
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Структура проекта

```
expense-tracker/
├── docker-compose.yml          # PostgreSQL
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Схема БД
│   └── src/
│       ├── modules/
│       │   ├── auth/           # JWT-аутентификация (login, refresh)
│       │   ├── users/          # Регистрация и профиль пользователя
│       │   ├── categories/     # Категории транзакций
│       │   └── transactions/   # Транзакции (CRUD + сводка)
│       ├── common/             # Guards, JWT strategy
│       ├── prisma/             # Prisma service
│       └── types/              # Общие Zod-схемы и TypeScript-типы
└── frontend/
    ├── app/                    # Next.js App Router (маршруты)
    │   ├── (auth)/             # login, register
    │   └── dashboard/          # главная + categories
    └── src/
        ├── features/           # Бизнес-фичи (auth, transactions, categories)
        ├── entities/           # Доменные типы (user, transaction, category)
        ├── widgets/            # Составные блоки (DashboardSidebar)
        └── shared/             # Базовый API-клиент, shadcn/ui компоненты
```

---

## API

Все маршруты доступны по префиксу `/api`. Большинство требуют заголовка `Authorization: Bearer <access_token>`.

### Аутентификация

| Метод | Маршрут | Описание | Auth |
|-------|---------|----------|------|
| POST | `/api/users/register` | Регистрация нового пользователя | — |
| POST | `/api/users/login` | Вход, возвращает access + refresh токены | — |
| GET | `/api/users/me` | Данные текущего пользователя | Bearer |

### Категории

| Метод | Маршрут | Описание | Auth |
|-------|---------|----------|------|
| GET | `/api/categories` | Список категорий пользователя | Bearer |
| POST | `/api/categories` | Создать категорию | Bearer |
| PATCH | `/api/categories/:id` | Обновить категорию | Bearer |
| DELETE | `/api/categories/:id` | Удалить категорию | Bearer |

### Транзакции

| Метод | Маршрут | Описание | Auth |
|-------|---------|----------|------|
| GET | `/api/transactions` | Список транзакций (с фильтрами и пагинацией) | Bearer |
| GET | `/api/transactions/summary` | Сводка: доходы, расходы, баланс | Bearer |
| GET | `/api/transactions/:id` | Транзакция по ID | Bearer |
| POST | `/api/transactions` | Создать транзакцию | Bearer |
| PATCH | `/api/transactions/:id` | Обновить транзакцию | Bearer |
| DELETE | `/api/transactions/:id` | Удалить транзакцию | Bearer |

Интерактивная документация со всеми схемами запросов и ответов доступна в Swagger UI: `http://localhost:3001/api/docs`.

---

## Модели данных

```
User          id, email, name, password, createdAt
Category      id, name, icon?, color?, userId
Transaction   id, amount, type (INCOME|EXPENSE), description?, date, categoryId, userId, createdAt
```

---

## Полезные команды

```bash
# Применить новые миграции БД
cd backend && npx prisma migrate dev

# Открыть Prisma Studio (GUI для БД)
cd backend && npx prisma studio

# Пересобрать Prisma-клиент после изменения схемы
cd backend && npx prisma generate

# Продакшен-сборка бэкенда
cd backend && npm run build && npm start

# Продакшен-сборка фронтенда
cd frontend && npm run build && npm start
```
