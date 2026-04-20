# ui-consistency-check

Use this workflow when the task is to align existing UI across screens without introducing new product behavior.

## Procedure

1. Restate which screens or component groups are being aligned.
2. Confirm the task is cleanup and consistency work, not a new feature or a redesign from scratch.
3. Check shared design language:
   - spacing rhythm should match across related screens
   - icon size and icon weight should stay consistent for similar actions
   - border radius, shadows, and surface treatment should reuse existing project patterns
4. Check typography and copy density:
   - headings, labels, helper text, and metrics should use a consistent hierarchy
   - long values should not wrap awkwardly when a smaller or adaptive size is more appropriate
   - repeated labels or decorative text should be reduced instead of compressed
5. Check component reuse:
   - prefer existing shared UI primitives before adding one-off styles
   - call out any screen that still bypasses shared components without a strong reason
6. If the affected screens include mobile layouts, also run `mobile-adaptation-check`.
7. Run `spec-check` before handoff.
8. End with exactly three lines:
   - `Changed: ...`
   - `Checked: ...`
   - `Risk: ...`

## Failure Rule

If visual consistency was reviewed from source only and not exercised in a browser, state that explicitly in `Checked:` or `Risk:`.
