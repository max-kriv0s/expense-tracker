# Схема базы данных

СУБД: PostgreSQL 16.
ORM: Prisma 5.
Файл схемы: `backend/prisma/schema.prisma`.

---

## Диаграмма связей

```
User 1 ──── N Category
User 1 ──── N Transaction
Category 1 ── N Transaction
```

Все ID — UUID v4, генерируются на уровне БД (`@default(uuid())`).

---

## Модели

### User

Учётная запись пользователя. Все остальные сущности привязаны к конкретному пользователю.

```prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  name         String
  password     String
  categories   Category[]
  transactions Transaction[]
  expenses     Expense[]
  createdAt    DateTime      @default(now())
}
```

| Поле | Тип | Ограничения | Назначение |
|------|-----|-------------|-----------|
| `id` | String (UUID) | PK, auto | Идентификатор пользователя |
| `email` | String | UNIQUE, NOT NULL | Email для входа. Уникальность гарантирована на уровне БД |
| `name` | String | NOT NULL | Отображаемое имя |
| `password` | String | NOT NULL | Хэш пароля (argon2). Никогда не возвращается в ответах API |
| `createdAt` | DateTime | NOT NULL, auto | Дата регистрации. Устанавливается автоматически |
| `categories` | Category[] | — | Relation: категории пользователя |
| `transactions` | Transaction[] | — | Relation: транзакции пользователя |
| `expenses` | Expense[] | — | Relation: legacy-расходы (не используются в текущем UI) |

---

### Category

Пользовательская категория для классификации транзакций. Каждая категория принадлежит конкретному пользователю — шаринг между пользователями не предусмотрен.

```prisma
model Category {
  id           String        @id @default(uuid())
  name         String
  icon         String?
  color        String?
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[]
  expenses     Expense[]
}
```

| Поле | Тип | Ограничения | Назначение |
|------|-----|-------------|-----------|
| `id` | String (UUID) | PK, auto | Идентификатор категории |
| `name` | String | NOT NULL | Название категории (например, «Продукты», «Зарплата») |
| `icon` | String? | nullable | Эмодзи или строковый идентификатор иконки. Используется в UI для отображения |
| `color` | String? | nullable | HEX-цвет категории (например, `#4CAF50`). Используется в UI для визуальной дифференциации |
| `userId` | String (UUID) | FK → User.id, NOT NULL | Владелец категории. При удалении пользователя — каскадное удаление (определяется на уровне Prisma) |
| `user` | User | — | Relation: владелец |
| `transactions` | Transaction[] | — | Relation: транзакции в этой категории |

**Важно:** категорию нельзя удалить, если к ней привязаны транзакции — нарушение FK вернёт ошибку `400`.

---

### Transaction

Основная бизнес-сущность. Представляет одну финансовую операцию — доход или расход.

```prisma
model Transaction {
  id          String          @id @default(uuid())
  amount      Decimal
  type        TransactionType
  description String?
  date        DateTime
  categoryId  String
  category    Category        @relation(fields: [categoryId], references: [id])
  userId      String
  user        User            @relation(fields: [userId], references: [id])
  createdAt   DateTime        @default(now())
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

| Поле | Тип | Ограничения | Назначение |
|------|-----|-------------|-----------|
| `id` | String (UUID) | PK, auto | Идентификатор транзакции |
| `amount` | Decimal | NOT NULL, positive | Сумма. Тип `Decimal` обеспечивает точность финансовых расчётов. В API приводится к `number` через `parseFloat` |
| `type` | TransactionType | NOT NULL | `INCOME` (доход) или `EXPENSE` (расход). Хранится как PostgreSQL enum |
| `description` | String? | nullable | Произвольный комментарий к транзакции. Не обязателен |
| `date` | DateTime | NOT NULL | Дата совершения операции. Задаётся пользователем (не дата создания записи). Хранится в UTC |
| `categoryId` | String (UUID) | FK → Category.id, NOT NULL | К какой категории относится транзакция |
| `userId` | String (UUID) | FK → User.id, NOT NULL | Кому принадлежит транзакция |
| `createdAt` | DateTime | NOT NULL, auto | Дата создания записи в БД. Используется для аудита |

**Разница `date` vs `createdAt`:**
- `date` — когда операция произошла в реальности (вводится пользователем, может быть задним числом).
- `createdAt` — когда запись была создана в системе (устанавливается автоматически).

---

### Expense (legacy)

Устаревшая модель, созданная на ранних этапах разработки. В текущем UI и API не используется. Оставлена для совместимости с ранними миграциями.

```prisma
model Expense {
  id          String   @id @default(uuid())
  amount      Float
  description String
  date        DateTime @default(now())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
}
```

Не добавлять новые эндпоинты для этой модели. Вся функциональность реализована через `Transaction`.

---

## Миграции

```bash
# Создать и применить новую миграцию
cd backend && npx prisma migrate dev --name <описание>

# Применить миграции в продакшене (без интерактивного режима)
cd backend && npx prisma migrate deploy

# Пересгенерировать Prisma-клиент без создания миграции
cd backend && npx prisma generate

# Открыть GUI для просмотра данных
cd backend && npx prisma studio
```

Файлы миграций хранятся в `backend/prisma/migrations/`. Коммитить их обязательно.

---

## Строка подключения

Задаётся через переменную окружения `DATABASE_URL` в `backend/.env`:

```
postgresql://<user>:<password>@<host>:<port>/<database>
```

Значение по умолчанию для локального docker-compose:
```
postgresql://user:password@localhost:5432/expense_tracker
```
