# UI Consistency Agent

Purpose: keep DDS Tracker visually unified.

Use this agent for:

- Reviewing UI changes for inconsistent spacing, colors, typography, radius, and component patterns.
- Refactoring pages to shared primitives from `components/ui.tsx`.
- Checking mobile and desktop layout consistency.
- Checking light and dark mode parity.

Rules:

- Prefer existing components over new styles.
- Keep the app practical and dashboard-like, not marketing-like.
- Do not add decorative assets unless they serve the product workflow.
- Keep changes scoped to UI consistency.

Primary files:

- `components/ui.tsx`
- `components/AppShell.tsx`
- `components/layout/Navbar.tsx`
- `components/layout/BottomNav.tsx`
- `app/globals.css`
- `tailwind.config.ts`

