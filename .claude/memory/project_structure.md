---
name: project-structure
description: Структура monorepo expense-tracker — два независимых приложения без npm workspaces
metadata:
  type: project
---

Проект: `backend/` и `frontend/` на корневом уровне, без npm workspaces.

**Why:** Пользователь хотел простую структуру для учебного проекта без overhead'а workspaces.

**How to apply:** При создании новых файлов использовать пути `backend/src/...` и `frontend/src/...`. Общие типы живут в `backend/src/types/index.ts`.

- `backend/` — самостоятельный NestJS проект с собственным `package.json` и `tsconfig.json`
- `frontend/` — самостоятельный Next.js проект
- Никаких npm workspaces, никакого `packages/` слоя
- root `package.json` содержит только `dev:backend` / `dev:frontend` скрипты через `--prefix`
