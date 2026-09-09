# Access control

This table reflects the guards and ownership filters in the current route
handlers. `Same-origin` applies to browser write requests where implemented.

| Resource | Read | Write | Enforcement |
| --- | --- | --- | --- |
| User/profile | User: own profile; admin: all users | User: own profile/password; admin: delete; public: signup/reset flows | `requireUser()` / admin guard; sensitive fields excluded from admin list |
| Business | Public: verified only; owner: own business; admin: all | Business owner: create/update services/availability/profile; admin: verify/delete | `requireUser("business")`, `requireUser("admin")`, owner query |
| Appointment | Customer: own; business: appointments for own business | Customer: book/request early arrival; business: update/confirm/check in | Role checks plus customer/business ownership queries |
| Queue | Public: verified business count/anonymous list; customer: own queues; business: own active queue | Customer: join/cancel own active item; business: add/reorder/status/delete own items | Role checks and queue/business ownership checks |
| Review | Public, including business-filtered reviews | Customer only, after completed visit; one per customer/business | Customer role check plus completed appointment/queue check |
| Notification | Authenticated user: own notifications | Authenticated user: mark own notifications read; server creates them | Recipient filter; no client creation route |
| Upload | No public read route | Any authenticated role may upload | `requireUser()` plus same-origin and file validation |

Admin routes cover users, businesses, stats, and exports. There is no admin
appointment, queue, review, or notification route. Some customer-facing GET
routes (`/api/appointments/customer`, `/api/queue/customer`) and early-arrival
use `getUser()` without an explicit `customer` role check; ownership filters
still scope their data, but role enforcement is inconsistent and should be
reviewed before extending those routes.

