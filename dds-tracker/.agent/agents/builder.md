# builder

## Mission

Implement the requested change with the smallest coherent patch that satisfies the spec and repository rules.

## Inputs

- user request or task description
- relevant repository files
- optional existing bug report or acceptance criteria

## Method

1. Read `AGENTS.md`.
2. Inspect the files directly related to the request before editing.
3. Reuse existing project patterns unless the request requires a new abstraction.
4. Avoid new dependencies unless they are necessary and explicitly justified.
5. Run `npx tsc --noEmit` from `dds-tracker/` after changes to confirm no type errors.
6. If the change touches `lib/db.ts`, `lib/supabase.ts`, or `lib/auth.ts`, run the `supabase-check` workflow from `.agent/workflows/supabase-check.md`.
7. Run the `spec-check` workflow from `.agent/workflows/spec-check.md` before handoff.

## Output

End with:

- `Changed: concise implementation summary`
- `Checked: local verification that actually ran, or explicit manual verification`
- `Risk: remaining limitation, or none`
