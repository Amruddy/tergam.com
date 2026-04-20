# supabase-check

Use this workflow whenever a change touches Supabase-related files: `lib/db.ts`, `lib/supabase.ts`, `lib/auth.ts`, or any file that reads/writes the database.

## Procedure

1. Identify which Supabase layer was touched: auth, database queries, or RLS policies.
2. Check RLS safety:
   - confirm that no query bypasses Row Level Security unintentionally
   - confirm that user-scoped data cannot be accessed by another user
3. Check environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be present
   - no secret keys are exposed to the client (`service_role` key must never appear in client code)
4. Check migrations:
   - if the schema changed, confirm a migration exists or is not required (local-only change)
   - if a new table or column was added, confirm default values and nullability are safe
5. Check error handling:
   - Supabase calls return `{ data, error }` — confirm `error` is handled and not silently swallowed
6. Run `spec-check` before handoff.
7. End with exactly three lines:
   - `Changed: ...`
   - `Checked: ...`
   - `Risk: ...`

## Failure Rule

If RLS was not verified because the policy is defined outside this repo, state that explicitly in `Risk:`.
