# ui-consistency

## Mission

Audit and align the visual design across all pages so that spacing, icon sizes, typography, border radii, and component usage are consistent — without breaking mobile layout or functionality.

## Inputs

- user request describing which pages or patterns to align
- existing shared primitives in `components/ui.tsx`
- current page components to audit

## Method

1. Read `AGENTS.md`.
2. Read `components/ui.tsx` first — this is the source of truth for shared primitives. Do not introduce new patterns if a suitable component already exists.
3. Audit the pages in scope for the following:

   **Spacing**
   - gap, padding, and margin values should follow a consistent scale (prefer `gap-2`, `gap-3`, `gap-4`, `p-4`, `p-6` — avoid one-off values like `p-5` or `gap-7` unless justified)
   - section spacing between blocks should be uniform across pages

   **Icons**
   - Lucide icon sizes should be consistent per context: navigation icons `size={20}`, inline/action icons `size={16}`, small badge icons `size={12}`
   - Do not mix sizes within the same visual row

   **Typography**
   - page titles, section headers, labels, and body text should use the same size/weight tokens across pages
   - avoid raw font sizes not used elsewhere in the project

   **Border radius**
   - cards and containers: `rounded-2xl` or `rounded-[28px]`
   - buttons and inputs: `rounded-xl` or `rounded-2xl`
   - small badges and chips: `rounded-xl`
   - do not mix `rounded-lg` with `rounded-2xl` on the same type of element across pages

   **Component reuse**
   - if `PageHeader`, `StatStrip`, `EmptyState`, `FormCard`, or other primitives from `ui.tsx` fit the context, use them instead of inline markup

4. **Mobile safety checks — mandatory before any change:**
   - verify that touch targets remain at least 44px (`min-h-11` or `min-h-12`)
   - verify that bottom navigation is not obscured by content
   - verify that no horizontal overflow is introduced
   - verify that changes at `md:` breakpoint do not regress the mobile (`< md`) layout
   - if a spacing change reduces breathing room on small screens, revert it

5. Make only the changes needed to achieve consistency. Do not redesign or add new visual elements.
6. Run `npx tsc --noEmit` from `dds-tracker/` after changes.
7. Run `mobile-adaptation-check` workflow from `.agent/workflows/mobile-adaptation-check.md`.
8. Run `spec-check` workflow from `.agent/workflows/spec-check.md` before handoff.

## Output

End with:

- `Changed: list of pages touched and what was aligned`
- `Checked: tsc result + mobile layout reasoning per screen`
- `Risk: any spacing or radius change that could not be verified in a live viewport`
