# Context

## Что это
- Личный finance tracker.
- Поддерживает доходы, расходы, счета, переводы, бюджеты, цели, автоплатежи, аналитику.
- UI ориентирован на mobile-first, есть desktop navbar и mobile bottom nav.

## Роуты
- `/` — home: summary, быстрый текстовый ввод, голосовой ввод, цель на главной, полная форма добавления.
- `/dashboard` — агрегированные карточки и графики.
- `/transactions` — список, фильтры, сортировка, CSV export, edit/delete.
- `/accounts` — счета, архив, переводы между счетами, история по счету.
- `/analytics` — KPI, cashflow, категории, теги, day-of-week.
- `/budgets` — месячные лимиты по расходным категориям.
- `/goals` — финансовые цели, пополнение, выбор цели для home.
- `/recurring` — повторяющиеся транзакции и ручное применение.

## Архитектура
- `app/layout.tsx` подключает `AppShell`, Vercel Analytics и Speed Insights.
- `AppShell` рендерит navbar, error banner sync и mobile bottom nav.
- Основная бизнес-логика сидит не в сервере, а в клиентском Zustand store.
- Все экраны читают и мутируют один store.

## Что важно помнить
- Если `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` не заданы, приложение работает локально без облака.
- Bootstrap данных вызывается из `Navbar`.
- `Recurring` автоприменяется на клиенте при открытии страницы recurring.
