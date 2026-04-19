# Data Flow

## Store
- `store/useTransactionStore.ts`
- Один persisted Zustand store `dds-tracker-store`.
- Сущности:
  - `accounts`
  - `transactions`
  - `transfers`
  - `budgets`
  - `goals`
  - `recurring`
  - `profile`
  - `settings`
- Есть `initialized`, `supabaseLoaded`, `syncError`.

## Доменные типы
- `types/index.ts`
- Основные типы: `Account`, `Transaction`, `Transfer`, `Budget`, `Goal`, `RecurringTransaction`, `Settings`, `UserProfile`.
- Валюты: `RUB | USD | EUR`.
- Темы: `light | dark`.

## Источник данных
- По умолчанию локальный persist.
- При наличии авторизованного Supabase user store загружает и синхронизирует данные в облако.
- CRUD методы store сразу обновляют local state, затем async sync в Supabase.

## Supabase
- `lib/supabase.ts` создаёт client только если есть env.
- `lib/auth.ts` даёт sign in / sign up / sign out / get user.
- `lib/db.ts` хранит load + upsert/delete для всех сущностей.
- `supabase/auth-setup.sql` добавляет `user_id`, индексы и RLS policy на owner-only доступ.

## Особенности миграции
- Persist version: `5`.
- Есть remap legacy default account ids.
- При первом cloud load, если в облаке нет счетов, туда пушатся локальные default accounts.

## Ошибки sync
- Ошибки попадают в `syncError`.
- `AppShell` показывает banner сверху контента.
- Settings upsert отдельно обрабатывает гонки и broken integer sequence в Supabase.
