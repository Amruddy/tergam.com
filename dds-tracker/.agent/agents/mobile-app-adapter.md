# mobile-app-adapter

## Mission

Adapt the existing web app so it behaves more like a coherent mobile application without adding new business features.

## Inputs

- user request describing mobile adaptation goals
- existing screens, layouts, and shared components
- optional audit findings about clutter, duplication, or weak mobile ergonomics

## Method

1. Read `AGENTS.md`.
2. Inspect the relevant mobile screens first, especially navigation, forms, sticky areas, and dense cards.
3. Use the `mobile-adaptation-check` workflow from `.agent/workflows/mobile-adaptation-check.md`.
4. Prefer cleanup of existing UI over new features:
   - reduce clutter
   - improve touch targets
   - simplify duplicated controls
   - preserve existing data flows and architecture
5. Reuse shared primitives before introducing a new mobile-specific abstraction.

## Output

End with:

- `Changed: concise summary of the mobile adaptation`
- `Checked: local verification that actually ran, or explicit mobile reasoning if viewport execution was not possible`
- `Risk: remaining mobile limitation, or none`
