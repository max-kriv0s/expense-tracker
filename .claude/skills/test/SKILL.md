---
name: test
description: Написать тесты для переданного файла и, при необходимости, настроить тестовую инфраструктуру
argument-hint: "<path-to-file>"
model: claude-sonnet-4-6
allowed-tools:
  - Bash(find*)
  - Bash(ls*)
  - Bash(cat*)
  - Bash(grep*)
  - Bash(npm*)
  - Read
  - Write
  - Edit
---

# Add Tests

## Аргументы

- `$0` — путь к файлу, для которого нужно написать тесты (обязательный)

## Алгоритм

### 1. Проверь аргумент

Если `$0` не передан — выведи сообщение об использовании и остановись:
```
Использование: /test <путь-к-файлу>
Пример: /test backend/src/modules/categories/categories.controller.ts
```

### 2. Прочитай целевой файл

Прочитай содержимое `$0`. Определи:
- **Контекст**: `backend` (путь начинается с `backend/`) или `frontend` (путь начинается с `frontend/`)
- **Тип файла**: controller, handler (command/query), service, util-функция, React-компонент, хук, API-клиент

### 3. Проверь наличие тестовой инфраструктуры

**Backend** — ищи в `backend/`:
```bash
grep -l "jest" backend/package.json
ls backend/jest.config* 2>/dev/null
```

**Frontend** — ищи в `frontend/`:
```bash
grep -l "vitest\|jest" frontend/package.json
ls frontend/vitest.config* frontend/jest.config* 2>/dev/null
```

### 4. Если инфраструктура отсутствует — предупреди и предложи план

Выведи пользователю, какие пакеты нужно установить и какие конфиги создать (см. секцию «Настройка» ниже), и дождись явного подтверждения. Только после подтверждения — настраивай.

### 5. Определи путь к тест-файлу

- **Backend**: рядом с исходником, расширение `.spec.ts`
  `backend/src/modules/categories/categories.controller.ts` → `backend/src/modules/categories/categories.controller.spec.ts`
- **Frontend**: рядом с исходником, расширение `.test.tsx` (для компонентов) или `.test.ts` (для хуков, утилит, API)

Если тест-файл уже существует — прочитай его и предупреди пользователя, что файл будет дополнен, а не перезаписан.

### 6. Составь тесты

Пиши тесты согласно типу файла (см. секцию «Шаблоны» ниже).

Правила:
- Покрывай happy path и основные edge cases
- Моки только для внешних зависимостей (БД, HTTP, сторонние сервисы)
- Описания тестов (`it`/`test`) — на русском языке
- `describe` — повторяет имя тестируемой сущности

### 7. Покажи план пользователю

Выведи:
- путь к тест-файлу (новый или дополняемый)
- список тест-кейсов (один bullet на `it`)
- если нужна настройка инфраструктуры — список изменений

Дождись явного подтверждения.

### 8. Примени изменения

1. Если нужна настройка инфраструктуры — выполни её.
2. Запиши тест-файл.
3. Запусти тесты для нового файла и покажи результат:
   - Backend: `cd backend && npx jest <тест-файл> --no-coverage`
   - Frontend: `cd frontend && npx vitest run <тест-файл>`

---

## Шаблоны тестов

### Backend — NestJS Controller

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { <Controller> } from './<controller>';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

describe('<Controller>', () => {
  let controller: <Controller>;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [<Controller>],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get(<Controller>);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  it('должен быть определён', () => {
    expect(controller).toBeDefined();
  });
});
```

### Backend — CQRS Handler

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { <Handler> } from './<handler>';
import { PrismaService } from '../../../prisma/prisma.service';

describe('<Handler>', () => {
  let handler: <Handler>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        <Handler>,
        {
          provide: PrismaService,
          useValue: { <model>: { findMany: jest.fn(), create: jest.fn() } },
        },
      ],
    }).compile();

    handler = module.get(<Handler>);
    prisma = module.get(PrismaService);
  });

  it('должен быть определён', () => {
    expect(handler).toBeDefined();
  });
});
```

### Backend — Util / чистая функция

```typescript
import { <function> } from './<file>';

describe('<function>', () => {
  it('должен ...', () => {
    expect(<function>(<args>)).toBe(<expected>);
  });
});
```

### Frontend — React-компонент (Vitest + React Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { <Component> } from './<Component>';

describe('<Component>', () => {
  it('должен отрендериться без ошибок', () => {
    render(<Component />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
});
```

### Frontend — Хук (Vitest)

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { <useHook> } from './<useHook>';

describe('<useHook>', () => {
  it('должен вернуть начальное состояние', () => {
    const { result } = renderHook(() => <useHook>());
    expect(result.current.<value>).toBe(<expected>);
  });
});
```

---

## Настройка тестовой инфраструктуры

### Backend (Jest + @nestjs/testing)

Установить:
```bash
cd backend && npm install --save-dev jest @types/jest ts-jest @nestjs/testing
```

Добавить в `backend/package.json`:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
},
"jest": {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

### Frontend (Vitest + React Testing Library)

Установить:
```bash
cd frontend && npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Создать `frontend/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
});
```

Создать `frontend/vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

Добавить в `frontend/package.json`:
```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

---

## Ограничения

- Не создавать тесты без явного подтверждения пользователя
- Не перезаписывать существующий тест-файл — только дополнять
- Не мокировать внутренние модули проекта — только внешние зависимости (БД, HTTP)
- Тест-файл должен проходить `npx tsc --noEmit` без ошибок
