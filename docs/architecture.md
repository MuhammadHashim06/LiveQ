# Architecture

## Runtime

Next.js App Router serves pages and API route handlers from `src/app`. The
custom `server.js` starts Next.js and Socket.IO. MongoDB is accessed through
Mongoose models in `src/models`, using the shared connection helper in
`src/lib/dbConnect.ts`.

## Main flows

1. **Identity:** signup creates an unverified `User` with role `customer` or
   `business`; OTP verification or login issues an httpOnly JWT cookie. Password
   reset and profile changes use the auth/user API routes.
2. **Business approval:** a business user creates one `Business`; it remains
   private until an admin verifies it. Public business listing/detail routes
   only return verified businesses.
3. **Appointments:** a customer books a verified business service. The business
   confirms or updates the appointment, then check-in creates a linked `Queue`
   item. Notifications, email, and Socket.IO events keep both dashboards current.
4. **Queues:** customers join a verified business queue; businesses can add
   walk-ins, reorder items, and move items through waiting/serving/completed or
   removal/cancellation. Completion updates related appointment and business
   statistics.
5. **Reviews:** a customer can review after a completed appointment or queue
   visit. The review is upserted per customer/business and recalculates the
   business rating.
6. **Frontend:** customer, business, and admin dashboards are route groups under
   `src/app/dashboard`; shared UI is in `src/components`. Public reads include
   verified business data, queue counts, and reviews.

## Cross-cutting services

`src/lib/auth.ts` handles JWT cookie parsing and role checks; `realtime.ts`
publishes queue, appointment, and notification events; `email.ts` sends mail;
`cloudinary.ts` handles authenticated image uploads.

