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

Trace the existing route and dashboard pattern, update the Mongoose model,
implement the protected route, add the smallest useful test, then integrate the
matching page/component. Follow the concrete checklist in
[the feature recipe](docs/recipes/add-new-entity.md).

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
[feature recipe](docs/recipes/add-new-entity.md). Inspect the nearest existing
route/model/page, check the current worktree before editing, make the smallest
change, and run lint, typecheck, and tests before handoff.

