# spec-check

Use this workflow before finalizing implementation or review work.

## Procedure

1. Restate the requested behavior in one sentence.
2. Compare the request against the touched files and note any uncovered part of the spec.
3. Confirm whether the change reused existing project patterns instead of adding a new abstraction.
4. Confirm whether a new dependency was added. If yes, justify it explicitly.
5. Check the highest-risk local verification available:
   - run `npx tsc --noEmit` from the `dds-tracker/` directory to confirm no type errors
   - for production-path changes, also run `next build` to catch broken imports and missing pages
   - targeted test if one exists
   - reasoned manual verification when execution is not practical — state this explicitly
6. End with exactly three lines:
   - `Changed: ...`
   - `Checked: ...`
   - `Risk: ...`

## Failure Rule

If any required check cannot be completed, say so in `Checked:` or `Risk:` instead of implying certainty.
