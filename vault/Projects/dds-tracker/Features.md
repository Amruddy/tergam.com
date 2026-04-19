# Features

## Home
- `components/home/HomePage.tsx`
- Верхняя summary strip: доходы месяца, расходы месяца, общий баланс.
- Быстрый текстовый ввод через `parseQuickInput`.
- Голосовой ввод через browser speech recognition.
- Карточка выбранной цели из localStorage key `tergam-home-goal-id`.
- Отдельная полная форма создания транзакции.

## Transactions
- `components/transactions/TransactionTable.tsx`
- Поиск по описанию, категории, счету, тегам.
- Фильтры: type, category, account, tag, date range.
- Сортировка по дате и сумме.
- Пагинация по 20.
- Mobile swipe-to-delete, desktop table edit/delete.
- CSV export через `lib/export.ts`.

## Accounts
- `components/accounts/AccountsPage.tsx`
- Создание/редактирование счета.
- Типы счетов: `cash`, `card`, `savings`, `debt`.
- Переводы между счетами.
- Архивирование счетов.
- При удалении аккаунта ссылки в операциях и recurring переносятся на fallback account.

## Budgets
- `components/budgets/BudgetsPage.tsx`
- Только monthly budget.
- Лимит на расходную категорию.
- Подсветка warning с 75% и over-budget.

## Goals
- `components/goals/GoalsPage.tsx`
- Цели с emoji, цветом, дедлайном, target/saved.
- Быстрое пополнение saved amount.
- Можно выбрать goal для показа на home.

## Recurring
- `components/recurring/RecurringPage.tsx`
- Частоты: daily, weekly, monthly.
- Есть active/pause.
- `applyRecurring()` создаёт обычные транзакции и обновляет `lastApplied`.

## Analytics
- `components/analytics/AnalyticsContent.tsx`
- Периоды: `1m`, `3m`, `6m`, `1y`, `all`.
- KPI: income, expense, balance, savings rate, avg daily expense, tx count.
- Графики: monthly cashflow, expense categories, income categories, tags, spending by weekday.
