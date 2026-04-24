---
name: dds-ui-consistency
description: Maintain a unified UI design for the DDS Tracker Next.js finance app. Use when editing pages, components, navigation, forms, dashboard widgets, charts, or styling so changes follow the existing design system and do not introduce conflicting visual patterns.
---

# DDS UI Consistency

Use this skill when changing the user interface.

## Workflow

1. Inspect nearby components before editing.
2. Prefer existing primitives from `components/ui.tsx`.
3. Keep page structure consistent with `components/AppShell.tsx`.
4. Check both mobile and desktop layouts.
5. Check light and dark classes together.
6. Avoid adding a new visual pattern unless it replaces repeated code or fixes a real design gap.

## Local Conventions

- Use `Card` for repeated framed content.
- Use `Btn` and `IconBtn` for commands.
- Use `PageHeader` for page-level titles.
- Use `inputCls` and existing form helpers for fields.
- Use `lucide-react` icons.
- Keep dashboard, accounts, budgets, goals, recurring, analytics, and transactions visually related.
- Keep border radius, spacing, font sizes, and color accents close to existing components.

## Before Finishing

- Search changed files for one-off `rounded-*`, `bg-*`, and `border-*` combinations that should use shared primitives.
- Make sure text does not overflow compact mobile cards.
- Run `npm.cmd run build` when code changed.

