## Project Overview

Expense Tracker — два независимых приложения: бэкенд и фронтенд.

### Architecture

- `backend/`: NestJS + Prisma ORM + PostgreSQL. CQRS-паттерн. Подробности — `backend/CLAUDE.md`.
- `frontend/`: Next.js (v16.2.6) + React 19 + Tailwind CSS v4. FSD-архитектура. Подробности — `frontend/CLAUDE.md`.
- Общие типы: `backend/src/types/index.ts`. При использовании на фронтенде — копировать в `frontend/src/entities/<entity>/model/types.ts`.

## Common Commands

### Infrastructure

- Запуск БД: `docker-compose up -d`
- Образ: `postgres:16-alpine`
- Данные: `./postgres_data`

### Backend (`backend/`)

- Dev-режим: `npm run dev`
- Сборка: `npm run build`
- Prisma миграция: `npx prisma migrate dev`
- Prisma клиент: `npx prisma generate`

### Frontend (`frontend/`)

- Dev-режим: `npm run dev`
- Сборка: `npm run build`

## Git Branch Strategy — GitHub Flow

Используем **GitHub Flow**: единственная долгоживущая ветка — `main`, вся работа ведётся в коротких фича-ветках.

### Правила веток

- `main` — всегда стабильна и деплоится; прямые коммиты в неё запрещены.
- Новая фича или исправление → новая ветка от `main`.
- Именование: `feature/<name>`, `fix/<name>`, `chore/<name>` (kebab-case, кратко).
- Ветка живёт только на время разработки фичи; после мержа удаляется.
- Перед слиянием в `main` — Pull Request (code review / обсуждение).
- Ветку держать актуальной: регулярно делать `git merge main` или `git rebase main`.

### Примеры имён веток

```
feature/main-page
feature/expenses-list
fix/auth-token-refresh
chore/update-dependencies
```

## Обновление docs

При добавлении функционала, проверяй документацию в @.claude/docs/\* и актуализируй

## Memory — ОБЯЗАТЕЛЬНО

Память проекта хранится в `.claude/memory/`. Это ПЕРЕОПРЕДЕЛЯЕТ системный путь памяти.

**При старте каждой сессии:** читай `.claude/memory/MEMORY.md` и все файлы, на которые он ссылается.

**При сохранении новых воспоминаний:** пиши ТОЛЬКО в `.claude/memory/` — никогда в `~/.claude/projects/`.

Формат файлов и структура индекса — стандартные (frontmatter с `name`, `description`, `metadata.type`; тело с **Why:** и **How to apply:**). Индекс: `.claude/memory/MEMORY.md`.
