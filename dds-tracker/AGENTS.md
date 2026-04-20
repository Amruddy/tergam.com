# AGENTS.md

## Purpose

This repository is a Next.js and TypeScript app. Keep changes small, typed, and aligned with the user request.

## Rules

1. Inspect the relevant files before editing. Do not guess architecture from file names alone.
2. Prefer minimal patches over broad refactors unless the request explicitly asks for restructuring.
3. Reuse existing patterns, utilities, and styling conventions before introducing new ones.
4. Avoid new dependencies for small tasks. If a new package is necessary, explain why.
5. Run the reusable `spec-check` workflow before finishing any non-trivial task.
6. State constraints plainly: what was changed, what was verified, and what remains unverified.
7. If a request is ambiguous, document the assumption that drove the implementation or review.
8. For cross-screen visual cleanup, run `ui-consistency-check` before handoff.
9. For Russian copy cleanup or encoding issues, run `russian-copy-check` before handoff.

## Role Model

Use these roles to separate responsibilities:

- `debugger`: diagnoses the root cause of a bug before any fix is attempted. Produces a problem statement for the builder. Does not change code.
- `builder`: implements the requested change, keeps patches minimal, runs `tsc --noEmit`, and runs `spec-check` before handoff.
- `refactor`: restructures existing code without changing behavior. No features, no fixes — only improved structure.
- `ui-consistency`: audits and aligns spacing, icon sizes, typography, border radii, and component reuse across pages. Always runs mobile safety checks before applying changes.
- `mobile-app-adapter`: adapts existing screens and flows for mobile use, prioritizing touch targets, reduced clutter, and stable viewport behavior.
- `spec-reviewer`: reviews the change against the request, identifies spec gaps or weak verification, and does not silently approve uncertainty.
- `release-agent`: performs final release readiness checks, confirms the reviewed change is safe to ship, and blocks release on unresolved risk.

Preferred handoff order:

1. `debugger` diagnoses root cause when a bug is reported (skip for feature requests).
2. `builder` changes code and records verification.
3. `mobile-app-adapter` is used when the main goal is improving existing screens for mobile app-like usage.
4. `spec-reviewer` checks request-to-diff alignment.
5. `release-agent` confirms release readiness.

## Required Final Response Shape

For implementation work, end with:

- `Changed:` short summary of the concrete edit
- `Checked:` what you verified locally
- `Risk:` remaining limitation, or `none`

For bug reports, prefer the `debugger` mission in `.agent/agents/debugger.md` before building.
For implementation work, prefer the `builder` mission in `.agent/agents/builder.md`.
For restructuring without behavior change, prefer the `refactor` mission in `.agent/agents/refactor.md`.
For cross-page design consistency (spacing, icons, radius, typography), prefer the `ui-consistency` mission in `.agent/agents/ui-consistency.md`.
For mobile-focused cleanup and adaptation, prefer the `mobile-app-adapter` mission in `.agent/agents/mobile-app-adapter.md`.
For review work, prefer the `spec-reviewer` mission in `.agent/agents/spec-reviewer.md`.
For final ship/no-ship decisions, prefer the `release-agent` mission in `.agent/agents/release-agent.md`.
When aligning UI across screens, run the `ui-consistency-check` workflow in `.agent/workflows/ui-consistency-check.md`.
When fixing Russian labels or mojibake, run the `russian-copy-check` workflow in `.agent/workflows/russian-copy-check.md`.
When touching Supabase files, run the `supabase-check` workflow in `.agent/workflows/supabase-check.md`.
