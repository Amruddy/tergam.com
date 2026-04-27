# DDS Tracker Agent Guide

Use this guide for all work in this repository.

## Project Shape

- Next.js App Router application in `app/`.
- Shared UI primitives live in `components/ui.tsx`.
- Global layout lives in `components/AppShell.tsx`, `components/layout/Navbar.tsx`, and `components/layout/BottomNav.tsx`.
- State lives in `store/useTransactionStore.ts`.
- Domain helpers live in `lib/`.

## Local Skills And Agents

- Use `.codex/skills/dds-ui-consistency/SKILL.md` for UI, layout, forms, navigation, and visual consistency work.
- Use `.codex/skills/dds-performance/SKILL.md` for dashboard speed, mobile performance, bundle size, charts, and app shell work.
- Use `.agent/agents/ui-consistency.md` as the project UI review role.
- Use `.agent/agents/performance-optimizer.md` as the project performance review role.
- Use `.agent/workflows/ui-consistency-check.md` and `.agent/workflows/performance-check.md` before finishing related changes.

## Design Rules

- Keep one product style across all pages: quiet finance dashboard, compact spacing, clear hierarchy.
- Reuse `Card`, `Btn`, `IconBtn`, `PageHeader`, `StatStrip`, `inputCls`, and form helpers from `components/ui.tsx`.
- Do not create new card/button/input styles when an existing primitive fits.
- Use `lucide-react` icons for controls and navigation.
- Keep dashboard and operational pages dense and scannable. Avoid marketing-style hero sections inside the app.
- Preserve light and dark mode parity.
- Do not add decorative gradient orbs, bokeh backgrounds, or unrelated illustrations.

## Performance Rules

- Keep `/dashboard` fast. Do not mount multiple heavy charts on first load.
- Put detailed charts on `/analytics`; keep dashboard as a compact overview.
- Avoid `framer-motion` in global shell and high-traffic dashboard widgets unless the interaction needs it.
- Prefer lightweight CSS for simple visualizations.
- Lazy-load modals and rarely used panels.
- After changing dashboard or shell code, run `npm.cmd run build` on Windows and compare `/dashboard` First Load JS.

## Verification Commands

- Use `npm.cmd run build` as the main production check on Windows.
- Use `npm.cmd run lint` when linting is configured or touched code is likely to be lint-sensitive.
- Use `npm.cmd run dev` only when visual or manual browser verification is needed.

## Domain Rules

- Treat money calculations carefully. Reuse existing domain helpers for parsing, formatting, totals, and aggregation when available.
- Do not change transaction, category, account, budget, or persistence semantics without checking `store/useTransactionStore.ts` and helpers in `lib/`.
- Preserve existing import, export, local storage, and migration behavior unless the user explicitly asks to change it.

## Mobile Rules

- Verify narrow mobile layouts when changing navigation, forms, dashboard cards, charts, tables, filters, or page actions.
- Avoid horizontal overflow. Prefer compact controls, responsive grids, and stable dimensions for repeated dashboard elements.
- Keep bottom navigation reachable and make sure it does not overlap primary page actions or modal controls.

## Change Scope

- Keep edits narrowly scoped to the requested task.
- Do not refactor shared primitives, store shape, routes, navigation structure, or persisted fields unless the task requires it.
- Do not rename files, routes, categories, accounts, or transaction fields without explicit approval.

## Git Rules

- Work from `Test` unless the user explicitly asks for another branch.
- Do not merge `main` into `Test` without checking history first.
- Do not reintroduce `.agent` or `AGENTS.md` content from old commits unless it matches this guide.
- Do not commit `.next`, `.next-dev.log`, `.next-dev.err.log`, or `tsconfig.tsbuildinfo`.
