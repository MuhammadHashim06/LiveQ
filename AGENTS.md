# LiveQ agent guide

LiveQ is a Next.js 15 App Router application for business queues, appointments,
reviews, notifications, and admin verification. It uses TypeScript, MongoDB via
Mongoose, JWT cookies, Socket.IO, Cloudinary uploads, and Nodemailer.

This repository is not NestJS/Prisma: API endpoints are `src/app/api/**/route.ts`
handlers and persistence models live in `src/models`.

## Environments and commands

- Development URL: `http://localhost:3000` (`npm run dev`).
- Production URL: none is committed. Set `NEXT_PUBLIC_APP_URL` to the deployed
  origin; it is used for application links such as password reset links.
- Checks: `npm run lint`, `npm run typecheck`, and `npm test`.
- Production: `npm run build`, then `npm run start`.
- Runtime configuration is described by `.env.example`; use local/deployment
  secret storage, never source-control real values.

## Conventions

- Pages and dashboard layouts are under `src/app`; reusable UI is under
  `src/components`; shared server helpers are under `src/lib`.
- API handlers call `dbConnect()`, use `getUser()`/`requireUser(role)`, and
  protect browser writes with `isSameOrigin(req)`.
- Validate request bodies at the route boundary, return `NextResponse.json`,
  and avoid exposing database or provider errors.
- Mongoose models define validation and indexes. There is no Prisma schema or
  migration directory; model/index changes are deployed with the application.
- Use the existing JWT roles: `admin`, `business`, and `customer`.

## Add a feature

Follow the repeatable [agent workflow](docs/agent-workflow.md): inspect first,
write a small plan, reuse existing helpers, implement the backend boundary and
frontend state together, add a focused test, run every repository check, and
commit one coherent stage. For a new persisted resource, use the concrete
[feature recipe](docs/recipes/add-new-entity.md).

## Shared code to reuse

- `src/lib/apiClient.ts` for browser API requests and consistent API errors.
- `src/lib/useRealtime.ts` plus the existing `use*` data hooks for live data;
  do not add a second polling or Socket.IO listener for the same resource.
- `src/lib/auth.ts`, `src/lib/authHelpers.ts`, and `src/lib/businessQuery.ts`
  for authentication, email/code handling, and business ownership queries.
- `src/lib/realtime.ts`, `Notification`, `email.ts`, and `cloudinary.ts` for
  existing server side effects when the surrounding feature uses them.

## Agent decision rules

1. Inspect the worktree and trace all callers before editing a shared helper.
2. Prefer the smallest change that satisfies the request; delete duplication
   before adding an abstraction.
3. Treat authentication, role checks, ownership filters, same-origin checks,
   input validation, status transitions, and data exposure as security or
   correctness boundaries. Never remove them for convenience.
4. Keep frontend state authoritative: after a mutation update the affected
   state or refresh only the affected dataset; do not refetch unrelated data.
5. Add or update a focused test when logic changes. Do not create speculative
   templates, dependencies, or infrastructure.
6. If requirements conflict with the code or docs, report the mismatch and
   follow the code only after confirming the intended behavior.

For the complete procedure, validation commands, and handoff format, read
[docs/agent-workflow.md](docs/agent-workflow.md).

## Never do this

- Never commit credentials, tokens, private keys, or production `.env` files.
- Never bypass `requireUser`, ownership checks, or same-origin protection.
- Never call a new business resource public until its data exposure is reviewed.
- Never describe a Mongoose change as a Prisma migration; verify indexes and
  deployment behavior instead.
- Never silently change queue transitions, appointment status, or rating rules.

## If an AI agent picks up a task

Start with this file, then read [architecture](docs/architecture.md),
[access control](docs/access-control.md), and the
[feature recipe](docs/recipes/add-new-entity.md). Next read the
[agent workflow](docs/agent-workflow.md), inspect the nearest existing
route/model/page, check the current worktree before editing, and define the
requested stage's non-goals. Finish with the full validation sequence and a
separate descriptive commit.
