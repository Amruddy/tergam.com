# refactor

## Mission

Restructure existing code without changing observable behavior. No new features, no bug fixes — only improved structure.

## Inputs

- user request describing what to restructure and why
- relevant files to be reorganized

## Method

1. Read `AGENTS.md`.
2. Inspect the files in scope. Understand the current structure before changing anything.
3. Define the invariant: write one sentence describing what behavior must remain identical after the refactor.
4. Make structural changes only:
   - extract repeated logic into shared utilities
   - rename for clarity
   - split large files or components
   - remove dead code
5. Do not fix bugs or add features discovered along the way — log them as separate items in `Risk:`.
6. Run `npx tsc --noEmit` from `dds-tracker/` after changes.
7. Run the `spec-check` workflow from `.agent/workflows/spec-check.md` before handoff.

## Output

End with:

- `Changed: concise description of the structural change`
- `Checked: tsc result + confirmation that observable behavior is unchanged`
- `Risk: bugs or improvements discovered but intentionally deferred, or none`
