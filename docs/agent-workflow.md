# Agent workflow

Use this procedure for every feature, bug fix, or refactor. Keep the change
small, use existing helpers, and stop when the requested behavior is covered.

## 1. Understand before editing

1. Run `git status --short` and inspect the nearest route, model, page, hook,
   and existing tests.
2. Trace the request end to end: browser action, API route, auth/ownership
   checks, model query, side effects, realtime event, and UI state update.
3. Identify the roles, data exposure, lifecycle transitions, and failure states
   affected by the change.
4. Check `docs/architecture.md`, `docs/access-control.md`, and the feature
   recipe. Note conflicts with the code before changing anything.

## 2. Plan the smallest safe change

Write down the goal, affected files, test/check to add, and explicit
non-goals. Reuse the existing pattern before introducing an abstraction:

- Frontend requests: `src/lib/apiClient.ts` (`apiRequest` and
  `getApiErrorMessage`).
- Frontend shared data: existing `use*` hooks and `useRealtime`.
- Backend authentication: `src/lib/auth.ts` and `src/lib/authHelpers.ts`.
- Business ownership: `src/lib/businessQuery.ts`.
- Side effects: `src/lib/realtime.ts`, `Notification`, `email.ts`, and
  `cloudinary.ts` where the surrounding feature already uses them.

Do not add a dependency, state library, service layer, or generic wrapper for
one caller. Do not change a status transition, ranking/position rule, auth
flow, or data exposure unless the request explicitly requires it.

## 3. Implement by boundary

- Model changes belong in `src/models`; include validation and indexes used by
  real queries. This app uses Mongoose, not Prisma migrations.
- API writes must use `isSameOrigin(req)` where the route protects browser
  mutations, then `requireUser(role)`, ownership filters, input validation, and
  the established `NextResponse.json` error shape.
- Frontend pages belong under the existing role route group. Use shared
  request/data helpers, and handle loading, empty, unauthorized, error, and
  stale/realtime states.
- Keep derived values and notifications close to the mutation that changes the
  source data. Emit the existing realtime event only after a successful write.
- Add a focused test for new validation, authorization, lifecycle, or derived
  logic. Prefer the built-in Node test runner and pure tests without a database.

## 4. Verify and review

Run, in this order:

```text
npm test
npm run lint
npm run typecheck
npm run build
```

Then run `git diff --check` and review the diff for secrets, accidental
business-logic changes, missing ownership checks, overly broad responses, and
duplicate helpers/listeners. If a check cannot run, report the exact command
and reason; do not claim it passed.

## 5. Handoff

Commit one coherent stage with a descriptive message. Report the commit,
changed behavior, checks run, warnings/failures, assumptions, and anything
deliberately deferred. Keep unrelated worktree changes untouched. Stop after
the requested stage when the task is explicitly staged.
