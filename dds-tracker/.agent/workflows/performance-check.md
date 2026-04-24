# Performance Check

Run this checklist before finishing dashboard or shell work:

1. No heavy chart library is imported by `app/dashboard/page.tsx` unless necessary.
2. Shared shell components do not import large optional UI.
3. Modals are lazy-loaded where practical.
4. Decorative animation is not mounted globally.
5. `npm.cmd run build` passes.
6. `/dashboard` First Load JS is not worse without a clear reason.

