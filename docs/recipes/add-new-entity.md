# Add a feature/entity

Use an existing nearby feature as the copy-and-adapt reference.

1. **Model:** add or update `src/models/<Entity>.ts` with a Mongoose schema,
   enum/length validation, timestamps, and indexes needed by real queries.
   Export through the existing `mongoose.models.X || mongoose.model(...)`
   pattern. There is no Prisma migration; review index creation during deploy.
2. **Backend route:** add `src/app/api/<resource>/route.ts` and `[id]/route.ts`
   only when needed. Start with `dbConnect()`, authenticate with
   `getUser()`/`requireUser(role)`, check ownership, protect writes with
   `isSameOrigin(req)`, validate body/query values, and return the repository's
   `NextResponse.json({ message })` error shape.
3. **Side effects:** use existing `realtime.ts`, `Notification`, `email.ts`,
   and `cloudinary.ts` helpers where the feature already has that pattern. Keep
   status transitions and derived statistics explicit and tested.
4. **Test:** add a focused `tests/*.test.ts` test using the built-in Node test
   runner. Test pure validation/rules without a database when possible; a route
   test that needs MongoDB must document its test database setup rather than
   silently using production data.
5. **Frontend:** add the page under the correct `src/app/dashboard/<role>`
   route, reuse `src/components`, call APIs through `src/lib/apiClient.ts`,
   place repeated data loading in a `use*` hook, handle loading, empty,
   unauthorized, and error states, and subscribe through `useRealtime` if the
   data changes live. After a mutation update the affected state or refresh
   only that dataset.
6. **Verify:** run `npm test`, `npm run lint`, `npm run typecheck`, then
   `npm run build`. Review the diff for secrets and confirm role/ownership
   behavior before committing.
