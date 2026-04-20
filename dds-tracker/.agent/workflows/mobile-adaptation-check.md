# mobile-adaptation-check

Use this workflow when adapting existing product screens for mobile app-like use without adding new product features.

## Procedure

1. Restate which existing screens or flows are being adapted for mobile.
2. Confirm the work improves existing behavior instead of inventing a new feature.
3. Check touch ergonomics:
   - interactive controls should be comfortable on small screens
   - fixed bars, drawers, and sticky panels should not block content
   - primary actions should remain reachable near the natural thumb zone
4. Check mobile information density:
   - remove duplicated labels or repeated metrics when space is tight
   - collapse secondary controls before shrinking primary content
   - keep one clear visual hierarchy per screen
5. Check viewport stability:
   - avoid horizontal overflow
   - verify forms and bottom navigation can coexist on small screens
   - call out any modal, keyboard, or safe-area risk
6. Run `spec-check` before handoff.
7. End with exactly three lines:
   - `Changed: ...`
   - `Checked: ...`
   - `Risk: ...`

## Failure Rule

If mobile behavior was reasoned about but not exercised in a browser-sized viewport, say so explicitly in `Checked:` or `Risk:`.
