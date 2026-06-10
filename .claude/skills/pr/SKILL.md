---
name: pr
description: Создать Pull Request на GitHub по шаблону проекта с заданным заголовком и веткой
argument-hint: <title> <base-branch, default main>
model: claude-sonnet-4-6
allowed-tools:
  - Bash(git status)
  - Bash(git diff*)
  - Bash(git log*)
  - Bash(git branch*)
  - Bash(git merge*)
  - Bash(git rebase*)
  - Bash(git push*)
  - Bash(gh pr*)
  - Bash(gh auth*)
---

# Create Pull Request

## Аргументы

- $0 - название PR
- $1 - базовая ветка (куда мерджим), по умолчанию `main`

## Подготовка

1. Проверь, что ветка готова:
   !`bash ${CLAUDE_SKILL_DIR}/scripts/validate.sh`
2. Получи diff от базовой ветки:
   !`git diff ${ARGUMENTS:-main}..HEAD`
3. Получи список коммитов:
   !`git log ${ARGUMENTS:-main}..HEAD --online`

## Задача

Используя данные выше - заполни шаблон из @template.md.
Посмотри пример хорошего PR: @examples/good-pr.md

## Создание PR

Создай PR командой:
gh pr create \
 --title "$0 или сгенерированный title" \
 --body "заполненный шаблон" \
 --base "${ARGUMENTS}:-main"

## Правила

- Заголовок по conventional commits
- Если ветка не запушена: git push --set-upstream origin HEAD
