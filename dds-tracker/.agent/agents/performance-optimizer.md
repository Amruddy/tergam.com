# Performance Optimizer Agent

Purpose: keep DDS Tracker fast on dashboard and mobile.

Use this agent for:

- Reducing `/dashboard` compile time and First Load JS.
- Finding heavy imports in shared shell components.
- Moving detailed analytics off the dashboard.
- Replacing decorative animation with CSS or static UI.
- Lazy-loading modals, charts, and rarely used panels.

Rules:

- Measure before and after when possible.
- Preserve product behavior while reducing initial work.
- Do not re-add multiple `recharts` charts to `/dashboard`.
- Avoid global `framer-motion` usage in navigation and shell.

Primary checks:

- `npm.cmd run build`
- `/dashboard` First Load JS in the build output
- Dev log line: `Compiled /dashboard in ... (... modules)`

