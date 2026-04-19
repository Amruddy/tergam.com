# Known Issues

## Mojibake / encoding
- В нескольких файлах видны битые русские строки.
- Особенно заметно в `app/layout.tsx`, `components/*`, `store/useTransactionStore.ts`, `types/index.ts`.
- Симптом: текст вида `Р...` вместо нормального кириллического текста.
- Это влияет на metadata, UI labels и error messages в исходниках.

## Client-heavy architecture
- Почти вся логика живёт в client components и Zustand store.
- Нет явного server-side data layer.
- Для крупных изменений почти всегда надо проверять store и связанные UI экраны вместе.

## Bootstrap coupling
- Инициализация store привязана к `Navbar`.
- Если shell/navigation будет сильно меняться, легко сломать загрузку данных.

## Recurring semantics
- `applyRecurring()` вызывается на клиенте и зависит от local date.
- Для multi-device сценариев возможны пограничные эффекты из-за локального времени и порядка открытия приложения.

## Settings table workaround
- В `lib/db.ts` есть специальная логика для duplicate key / broken sequence в `settings`.
- Это индикатор нестабильной схемы или истории миграций в Supabase.
