---
name: commit
description: Создать git-коммит по Conventional Commits с проверкой изменений и подтверждением пользователя
model: claude-sonnet-4-6
allowed-tools:
  - Bash(git status)
  - Bash(git diff*)
  - Bash(git log*)
  - Bash(git add*)
  - Bash(git commit*)
---

# Commit Changes

## Алгоритм

1. **Проверь текущую ветку** — если `main`, остановись и предупреди пользователя: коммиты напрямую в `main` запрещены.

2. **Собери контекст выпонения**:
   Статус проекта !`git status`
   Посление коммиты !`git log --oneline -10`

3. **Собери информацию об изменениях** (параллельно):

- `git diff`
- `git diff --staged`

4. **Исключи из коммита** файлы: `.env`, `*.local`, credentials и другие секреты.

5. **Составь сообщение коммита** по Conventional Commits (см. справочник ниже).

6. **Покажи пользователю план**:
   - список файлов, которые войдут в коммит
   - предлагаемое сообщение коммита

   Дождись явного подтверждения.

7. **Создай коммит** после подтверждения:
   - `git add <конкретные файлы>` (не `git add -A` / `git add .`)
   - коммит через HEREDOC:

     ```bash
     git commit -m "$(cat <<'EOF'
     <type>(<scope>): <description>

     Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
     EOF
     )"
     ```

8. **Проверь результат** — выведи `git status`.

---

## Справочник — Conventional Commits

Формат: `<type>(<scope>): <description>`

### Типы (type)

- `feat` — новая функциональность
- `fix` — исправление бага
- `refactor` — рефакторинг без изменения поведения
- `style` — форматирование, отступы (без изменения логики)
- `test` — тесты
- `docs` — документация
- `chore` — инфраструктура, зависимости, конфиги

### Области (scope)

- `auth`, `expenses`, `categories`, `transactions` — фичи
- `backend`, `frontend` — приложения в целом
- `db`, `api`, `ui` — технические слои

### Правила описания

- Английский язык, повелительное наклонение («add», «fix», «remove»)
- Без заглавной буквы в начале и точки в конце
- Если закрывает задачу — добавить `Closes #N` в тело коммита

### Примеры

```
feat(auth): add JWT refresh token rotation
fix(expenses): handle empty category on create
chore(db): add postgres docker-compose config
docs: update CLAUDE.md with commit convention
```

---

## Ограничения

- Не создавать коммит без явного подтверждения пользователя
- Не использовать `git add -A` или `git add .` — только конкретные файлы
- Не пропускать хуки (`--no-verify` запрещён)
- Не изменять историю (`--amend` запрещён без явной просьбы)
- Не включать файлы с секретами: `.env`, `*.local`, credentials
- Не коммитить напрямую в `main`
