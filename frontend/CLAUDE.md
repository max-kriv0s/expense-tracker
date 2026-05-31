## Architecture — Feature Slice Design (FSD)

```
frontend/
├── app/                            # Next.js App Router (только маршрутизация)
│   ├── (auth)/
│   │   ├── layout.tsx              # Центрированный layout для auth-страниц
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout (sidebar + main)
│   │   ├── page.tsx                # Главная страница (транзакции)
│   │   └── categories/page.tsx
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Редирект на /login
└── src/
    ├── widgets/                    # Составные блоки UI (компонуют несколько фич)
    │   └── sidebar/ui/
    │       └── DashboardSidebar.tsx
    ├── features/                   # Бизнес-фичи
    │   ├── auth/
    │   │   ├── api/authApi.ts
    │   │   ├── model/useAuth.ts
    │   │   ├── model/schemas.ts
    │   │   └── ui/LoginForm.tsx, RegisterForm.tsx
    │   ├── transactions/
    │   │   ├── api/transactionsApi.ts
    │   │   ├── model/types.ts
    │   │   ├── model/schemas.ts
    │   │   └── ui/TransactionList.tsx, TransactionItem.tsx,
    │   │        TransactionFilters.tsx, SummaryCards.tsx,
    │   │        CreateTransactionModal.tsx
    │   └── categories/
    │       └── api/categoriesApi.ts
    ├── entities/                   # Доменные сущности (только типы)
    │   ├── user/model/types.ts
    │   ├── transaction/model/types.ts
    │   └── category/model/types.ts
    └── shared/                     # Переиспользуемое между слоями
        ├── api/client.ts           # Базовый fetch-клиент + ApiError
        ├── lib/utils.ts            # cn() и другие утилиты
        └── ui/                     # shadcn/ui компоненты
            badge, button, card, checkbox, dialog,
            input, label, pagination, skeleton
```

### FSD правила

- Импорты идут только вниз по слоям: `widgets` → `features` → `entities` → `shared`.
- Внутри слоя — кросс-импорты запрещены (features не импортируют другие features).
- Алиасы tsconfig: `@/widgets/*`, `@/features/*`, `@/entities/*`, `@/shared/*`.
- Новые shadcn-компоненты добавлять в `src/shared/ui/`.
- Новые фичи создавать по образцу `src/features/auth/`.
- Составные layout-компоненты (sidebar, header) — в `src/widgets/`.

### UI-стек

- Компоненты: shadcn/ui (написаны вручную в `src/shared/ui/`)
- Стили: Tailwind CSS v4 + CSS-переменные в `app/globals.css` (`@theme { --color-* }`)
- Формы: react-hook-form + zod (схемы в `features/<name>/model/schemas.ts`)
- Типы сущностей: копируются из `backend/src/types/index.ts` в `entities/<name>/model/types.ts`

### Аутентификация

- Токены хранятся в `localStorage` (`access_token`, `refresh_token`).
- Базовый fetch-клиент (`shared/api/client.ts`) автоматически подставляет `Authorization: Bearer <token>`.
- При 401 — автоматический refresh через `auth/api/authApi.ts`.

## Commands

- Dev-режим: `npm run dev`
- Сборка: `npm run build`

## Development Guidelines

- URL бэкенда: переменная окружения `NEXT_PUBLIC_API_URL` (по умолчанию `http://localhost:3001/api`).
- Бэкенд запускается на порту **3001**, фронтенд — **3000**.
- Новые страницы добавлять только в `app/`, бизнес-логику — в `features/`.
- `app/` не должен содержать бизнес-логику — только импорты из `widgets/` и `features/`.
