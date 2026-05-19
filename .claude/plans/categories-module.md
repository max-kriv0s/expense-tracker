# Plan: Categories Module (CQRS)

## Context
Добавляем модуль категорий трат к бэкенду на NestJS. Категории привязаны к пользователю (userId), имеют поля: id, name, color, icon, userId. Используем единый для проекта паттерн CQRS (CommandBus/QueryBus), как в модулях `users` и `auth`. Контроллер защищён `JwtAuthGuard`, валидация через `class-validator`.

---

## Новая структура файлов
```
src/modules/categories/
  commands/
    create-category.command.ts
    update-category.command.ts
    delete-category.command.ts
    handlers/
      create-category.handler.ts
      update-category.handler.ts
      delete-category.handler.ts
  queries/
    get-user-categories.query.ts
    handlers/
      get-user-categories.handler.ts
  dto/
    category.dto.ts
  categories.controller.ts
  categories.module.ts
```

---

## Чеклист реализации

### Prisma Schema (`backend/prisma/schema.prisma`)
- [x] Добавить `color String?` в `Category`
- [x] Убрать `@unique` с `Category.name`
- [x] Добавить `userId String` и relation `user User @relation(fields: [userId], references: [id])`
- [x] Добавить `categories Category[]` в модель `User`

### Types (`backend/src/types/index.ts`)
- [x] Добавить `CreateCategorySchema` (name required, color?, icon?)
- [x] Добавить `UpdateCategorySchema` через `.partial()`
- [x] Экспортировать типы `CreateCategory`, `UpdateCategory`

### `backend/src/main.ts`
- [x] Добавить `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))`

### DTO (`src/modules/categories/dto/category.dto.ts`)
- [x] `CreateCategoryDto` с `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`
- [x] `UpdateCategoryDto` — все поля опциональны

### Commands
- [x] `create-category.command.ts` — поля: name, color, icon, userId
- [x] `update-category.command.ts` — поля: id, userId, name?, color?, icon?
- [x] `delete-category.command.ts` — поля: id, userId
- [x] `create-category.handler.ts` — создаёт через `prisma.category.create`
- [x] `update-category.handler.ts` — проверяет принадлежность → `NotFoundException`, обновляет
- [x] `delete-category.handler.ts` — проверяет принадлежность → `NotFoundException`, удаляет

### Queries
- [x] `get-user-categories.query.ts` — поле: userId
- [x] `get-user-categories.handler.ts` — `prisma.category.findMany({ where: { userId } })`

### Controller (`src/modules/categories/categories.controller.ts`)
- [x] `@Controller('categories')` + `@UseGuards(JwtAuthGuard)` на классе
- [x] `POST /` → `CreateCategoryCommand`
- [x] `GET /` → `GetUserCategoriesQuery`
- [x] `PATCH /:id` → `UpdateCategoryCommand`
- [x] `DELETE /:id` → `DeleteCategoryCommand`
- [x] `userId` из `req.user.userId`

### Module (`src/modules/categories/categories.module.ts`)
- [x] Импорт `CqrsModule`, `AuthModule`
- [x] Провайдеры: `PrismaService` + все handlers

### App Module (`src/app.module.ts`)
- [x] Добавить `CategoriesModule` в imports

### Prisma Migration
- [x] `npx prisma migrate dev --name add-category-user-relation`

### package.json
- [x] Добавить команды `migrate` и `migrate:rollback`

---

## Проверка
1. `npm run build` — компиляция без ошибок
2. `POST /api/categories` с Bearer-токеном → категория создана
3. `GET /api/categories` → только категории текущего пользователя
4. `PATCH /api/categories/:id` → поля обновлены
5. `DELETE /api/categories/:id` → удалена; чужая → 404
6. Запрос без токена → 401
