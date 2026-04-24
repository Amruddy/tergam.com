---
name: dds-performance
description: Optimize DDS Tracker for faster dashboard loads, lower First Load JS, smoother mobile navigation, and less client-side work. Use when changing dashboard, analytics, app shell, store subscriptions, charts, animations, or route-level imports.
---

# DDS Performance

Use this skill when performance, bundle size, or mobile responsiveness matters.

## Priorities

1. Keep `/dashboard` lightweight.
2. Keep heavy analytics on `/analytics`.
3. Avoid global imports of heavy libraries from shell components.
4. Lazy-load modals, charts, and rarely used panels.
5. Replace simple chart needs with CSS when full `recharts` is unnecessary.
6. Avoid decorative `framer-motion` in frequently mounted components.

## Dashboard Budget

- Target `/dashboard` First Load JS near or below the current optimized level.
- Do not add multiple `recharts` widgets back to `/dashboard`.
- Keep dashboard focused on stats, quick links, one compact trend view, and recent transactions.

## Checks

- Run `npm.cmd run build`.
- Compare the `Route (app)` table for `/dashboard`.
- If dev compile is the issue, check module count in `Compiled /dashboard in ... (... modules)`.

