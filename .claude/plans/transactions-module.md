# План: TransactionsModule

## Контекст
Нужен центральный модуль учёта доходов и расходов. В схеме уже есть модель `Expense` (устаревшая, без типа INCOME/EXPENSE) — её не трогаем. Создаём новую модель `Transaction` с enum-полем `type` и модуль по образцу `CategoriesModule` (CQRS паттерн).

---

## Статус: РЕАЛИЗОВАНО ПОЛНОСТЬЮ ✓

Все шаги выполнены, сборка `npm run build` прошла без ошибок, миграция применена к БД.

---

## Шаг 1 — schema.prisma ✅
Файл: `backend/prisma/schema.prisma`

- [x] Добавлен enum `TransactionType { INCOME, EXPENSE }`
- [x] Добавлена модель `Transaction` (id, amount: Decimal, type, description?, date, categoryId, userId, createdAt)
- [x] В `User` добавлена обратная связь `transactions Transaction[]`
- [x] В `Category` добавлена обратная связь `transactions Transaction[]`
- [x] Миграция `20260519060124_add_transactions` создана и применена к БД
- [x] Prisma Client перегенерирован

---

## Шаг 2 — main.ts ✅
Файл: `backend/src/main.ts`

- [x] Добавлен `transform: true` в `ValidationPipe` — необходим для автоматического приведения query-params к числам в `GetSummaryQueryDto`

```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

---

## Шаг 3 — types/index.ts ✅
Файл: `backend/src/types/index.ts`

- [x] Добавлен `TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE'])`
- [x] Добавлен `TransactionSchema` (id, amount, type, description nullable, date, categoryId, userId, createdAt)
- [x] Добавлен `TransactionSummarySchema` (totalIncome, totalExpense, balance)
- [x] Экспортированы типы `TransactionType`, `Transaction`, `TransactionSummary`

---

## Шаг 4 — Структура модуля ✅

Создано 14 файлов:

```
src/modules/transactions/
├── [x] transactions.module.ts
├── [x] transactions.controller.ts
├── dto/
│   └── [x] transaction.dto.ts
├── commands/
│   ├── [x] create-transaction.command.ts
│   ├── [x] update-transaction.command.ts
│   ├── [x] delete-transaction.command.ts
│   └── handlers/
│       ├── [x] create-transaction.handler.ts
│       ├── [x] update-transaction.handler.ts
│       └── [x] delete-transaction.handler.ts
└── queries/
    ├── [x] get-transactions.query.ts
    ├── [x] get-transaction-by-id.query.ts
    ├── [x] get-transactions-summary.query.ts
    └── handlers/
        ├── [x] get-transactions.handler.ts
        ├── [x] get-transaction-by-id.handler.ts
        └── [x] get-transactions-summary.handler.ts
```

### dto/transaction.dto.ts ✅
- [x] `CreateTransactionDto` — amount, type, description?, date, categoryId
- [x] `UpdateTransactionDto` — все поля опциональны
- [x] `GetTransactionsQueryDto` — dateFrom?, dateTo?, type?, categoryId?
- [x] `GetSummaryQueryDto` — month (@Min(1) @Max(12)), year (@Min(2000) @Max(2100)), оба с `@Type(() => Number)`
- [x] Локальный enum `TransactionTypeEnum { INCOME, EXPENSE }`

### Commands ✅
- [x] `CreateTransactionCommand(userId, amount, type, date, categoryId, description?)`
- [x] `UpdateTransactionCommand(id, userId, amount?, type?, date?, categoryId?, description?)`
- [x] `DeleteTransactionCommand(id, userId)`

### Queries ✅
- [x] `GetTransactionsQuery(userId, dateFrom?, dateTo?, type?, categoryId?)`
- [x] `GetTransactionByIdQuery(id, userId)`
- [x] `GetTransactionsSummaryQuery(userId, month, year)`

### Command Handlers ✅
- [x] **create**: `prisma.transaction.create(...)` → `parseFloat(raw.amount.toString())`
- [x] **update**: findFirst({ id, userId }) → NotFoundException → update → parseFloat
- [x] **delete**: findFirst({ id, userId }) → NotFoundException → delete → parseFloat

### Query Handlers ✅
- [x] **get-transactions**: findMany с динамическими фильтрами, `orderBy: { date: 'desc' }`
- [x] **get-transaction-by-id**: findFirst({ id, userId }) → NotFoundException → parseFloat
- [x] **get-transactions-summary**: агрегация через `prisma.transaction.groupBy` по полю `type`, `_sum.amount`, диапазон дат через `Date.UTC` — один запрос к БД

### transactions.controller.ts ✅
- [x] `@Controller('transactions') @UseGuards(JwtAuthGuard)`
- [x] `POST /` → CreateTransactionCommand
- [x] `GET /` → GetTransactionsQuery (с query-params фильтрами)
- [x] `GET /summary` → GetTransactionsSummaryQuery (**объявлен ДО `/:id`**)
- [x] `GET /:id` → GetTransactionByIdQuery
- [x] `PATCH /:id` → UpdateTransactionCommand
- [x] `DELETE /:id` → DeleteTransactionCommand

### transactions.module.ts ✅
- [x] `imports: [CqrsModule, AuthModule]`
- [x] `providers: [PrismaService, ...commands, ...queries]`

---

## Шаг 5 — app.module.ts ✅
Файл: `backend/src/app.module.ts`

- [x] Добавлен импорт `TransactionsModule`
- [x] `TransactionsModule` зарегистрирован в `imports`

---

## Шаг 6 — Сборка ✅

- [x] `npm run build` — прошла без ошибок и предупреждений

---

## Проверка (ручная — не выполнялась)

Для проверки запустить бэкенд (`npm run dev`) и протестировать через curl или Postman:

- [ ] `POST /api/transactions` → 201
- [ ] `GET /api/transactions` → массив
- [ ] `GET /api/transactions?type=INCOME` → фильтрация по типу
- [ ] `GET /api/transactions?dateFrom=2026-05-01&dateTo=2026-05-31` → фильтрация по дате
- [ ] `GET /api/transactions/summary?month=5&year=2026` → `{ totalIncome, totalExpense, balance }`
- [ ] `GET /api/transactions/:id` → объект
- [ ] `PATCH /api/transactions/:id` → обновлённый объект
- [ ] `DELETE /api/transactions/:id` → удалённый объект
