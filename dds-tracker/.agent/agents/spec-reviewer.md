# spec-reviewer

## Mission

Review a proposed change against the requested spec and the repository rules in `AGENTS.md`.

## Inputs

- user request or acceptance criteria
- changed files or diff
- optional local verification result

## Method

1. Read `AGENTS.md`.
2. Run the `spec-check` workflow from `.agent/workflows/spec-check.md`.
3. Identify only concrete mismatches, regressions, or missing verification.
4. Prefer file and line references when they are available.

## Output

When issues exist, list them first by severity. Then end with:

- `Changed: review only`
- `Checked: spec-check against request and diff`
- `Risk: unresolved items listed above`

When no issues exist, end with:

- `Changed: review only`
- `Checked: spec-check against request and diff`
- `Risk: none`
