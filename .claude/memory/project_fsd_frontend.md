---
name: project-fsd-frontend
description: Frontend использует Feature Slice Design архитектуру с shadcn/ui и react-hook-form
metadata:
  type: project
---

Frontend реализован по архитектуре Feature Slice Design (FSD).

**Why:** Пользователь явно выбрал FSD как архитектуру для фронтенда.

**How to apply:** При добавлении новых фич создавать в `src/features/<name>/` с подпапками `api/`, `model/`, `ui/`. Не нарушать правило однонаправленных зависимостей (features → entities → shared).

### Ключевые детали
- UI: shadcn/ui компоненты написаны вручную в `src/shared/ui/` (Button, Input, Label, Card)
- CSS: Tailwind v4, переменные в `app/globals.css` через `@theme { --color-* }`
- Формы: react-hook-form + zod, схемы в `features/<name>/model/schemas.ts`
- API клиент: `src/shared/api/client.ts`
- Токены: localStorage (`access_token`, `refresh_token`)
- tsconfig алиасы: `@/features/*`, `@/entities/*`, `@/shared/*`
- `NEXT_PUBLIC_API_URL` — URL бэкенда (default: `http://localhost:3001/api`)
