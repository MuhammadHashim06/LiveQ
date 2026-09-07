# LiveQ Mobile App PRD

## 1. Document Summary

- Product: LiveQ Mobile App
- Product type: Native-feeling mobile companion for the existing LiveQ web platform
- Document date: August 1, 2026
- Source of truth: Current LiveQ web codebase in this repository
- Recommended release strategy: Customer app MVP first, business companion features second, admin mobile deferred

## 2. Executive Recommendation

LiveQ already has strong mobile-relevant customer workflows in the web app: finding businesses, joining live queues, booking appointments, tracking queue position, requesting early arrival, receiving notifications, and leaving reviews. Because these behaviors are frequent, time-sensitive, and location-aware, the product is a strong candidate for mobile.

The best first mobile release is a customer-first app with limited business companion features. A full business operations app can follow once push notifications, real-time sync, and operational safeguards are strengthened. Admin should remain web-first.

## 3. Background

LiveQ is a queue and appointment management platform with three roles:

- Customer
- Business
- Admin

The current web product supports:

- Account signup, login, email verification, password reset
- Business discovery via search, filters, and map
- Public business detail pages with services and live queue visibility
- Joining a live queue
- Appointment booking with business-hours validation
- Customer queue and appointment history
- Early-arrival requests for same-day confirmed appointments
- Reviews and ratings
- Business onboarding, service management, availability, location, queue management, appointment handling, analytics, reviews, and settings
- Admin dashboards for users, businesses, verification, reports, and exports

## 4. Problem Statement

Customers currently use a browser-based experience for highly time-sensitive actions:

- Checking queue position
- Watching for their turn
- Joining a queue while on the move
- Booking appointments near their current location
- Receiving updates when a queue advances

This creates friction because the current experience relies heavily on page polling and browser sessions instead of mobile-native behaviors such as push notifications, persistent login, location permission flows, and quick re-entry.

Businesses also benefit from mobile access for quick operational tasks, but their workflows are more complex and better suited for a second phase unless we intentionally ship a lighter operator app.

## 5. Product Vision

Help customers arrive just in time instead of waiting in line, while giving businesses a lightweight mobile control surface for queue and appointment operations.

## 6. Goals

### Primary goals

- Reduce perceived waiting time for customers
- Increase repeat usage of queue join and appointment booking flows
- Improve customer show-up rates through timely alerts
- Make LiveQ feel reliable for real-time, on-the-go usage

### Secondary goals

- Give businesses a mobile way to monitor live operations
- Increase review completion after completed visits
- Improve retention through saved history and personalized discovery

## 7. Non-Goals for MVP

- Full admin dashboard on mobile
- Deep business analytics editing or exports
- Complex multi-location enterprise workflows
- Full offline mode
- In-app payments
- Social or entertainment rebuild beyond simple embedding or links

## 8. Target Users

### Primary user: Customer

Profile:

- Finds nearby service businesses
- Wants to avoid physically waiting
- Books ahead or joins on demand
- Needs confidence about when to leave and arrive

Core jobs:

- Discover a business
- See queue length and estimated wait
- Join queue fast
- Book an appointment fast
- Get notified when action is needed
- Track status without reopening multiple pages

### Secondary user: Business operator

Profile:

- Small business owner or front-desk operator
- Needs quick operational control during live service hours

Core jobs:

- View active queue
- Move customers through statuses
- Add walk-ins
- Check in appointments
- Respond to early arrivals

### Tertiary user: Admin

Profile:

- Platform operator

Recommendation:

- Keep web-only for phase 1 and likely phase 2

## 9. Mobile Product Strategy

### Recommended app structure

One mobile app with role-based experiences:

- Customer experience for MVP
- Lightweight business experience in phase 2
- No admin experience initially

### Why this approach

- Reuses the existing auth and data model
- Keeps one brand and one install surface
- Allows role-based navigation after login
- Avoids splitting growth and maintenance across separate apps too early

## 10. MVP Scope

### Customer MVP

#### Authentication and account

- Sign up
- Log in
- Log out
- Email verification status handling
- Forgot/reset password
- Basic profile view/edit

#### Discovery

- Browse nearby businesses on map and list
- Search by name or address
- Filter by category
- Sort by distance
- Sort by rating

#### Business details

- Business name, category, address
- Services list
- Rating and total customers served
- Current active queue count
- Estimated wait time

#### Queue experience

- Join queue
- View current queue position
- View people ahead / estimated wait
- View live status updates
- Leave queue

#### Appointment experience

- Book appointment
- Enforce business availability rules
- View upcoming appointments
- View past appointments
- Request early arrival for same-day confirmed appointments

#### Notifications

- In-app notification center
- Push notifications for key events

#### Reviews

- Leave or update rating and comment after completed service

### Business phase 2 scope

- View active queue
- Add walk-in customer
- Reorder queue
- Mark serving / completed / no-show / removed
- View today’s appointments
- Confirm or cancel appointments
- Check appointment into queue
- See early-arrival requests
- Read notifications

### Admin

- No mobile scope in MVP or phase 2 unless a narrow approval workflow is later prioritized

## 11. Key Mobile Use Cases

### Customer use cases

- As a customer, I want to find nearby businesses so I can avoid visiting places with long waits.
- As a customer, I want to join a queue remotely so I do not have to stand in line.
- As a customer, I want live queue progress so I know when to leave for the business.
- As a customer, I want a push alert when my turn is close or active.
- As a customer, I want to book an appointment within the business’s working hours.
- As a customer, I want to request early arrival so the business can pull me in sooner if possible.
- As a customer, I want to review a business after my visit.

### Business use cases

- As a business operator, I want to see the live queue from my phone during busy hours.
- As a business operator, I want to move customers through the queue quickly.
- As a business operator, I want to check in scheduled appointments into the queue.
- As a business operator, I want to act on early-arrival requests.

## 12. User Experience Principles

- Fast entry: critical actions should be reachable in 1 to 2 taps after opening the app
- Status-first: queue position, wait time, and next action should dominate the home screen
- Location-aware: nearby discovery should feel native and permission-friendly
- Trustworthy: timestamps, refresh state, and status labels must be clear
- Low-friction: repeat actions should reuse saved identity and preferences

## 13. Proposed Information Architecture

### Customer navigation

- Home
- Explore
- Activity
- Notifications
- Profile

### Customer screen map

- Home
- Nearby businesses
- Search results
- Business detail
- Join queue confirmation
- Active queue tracker
- Book appointment
- Upcoming appointments
- Past visits
- Review flow
- Notifications inbox
- Profile and account settings

### Business phase 2 navigation

- Overview
- Queue
- Appointments
- Notifications
- Settings

## 14. Detailed Functional Requirements

### 14.1 Customer home

- Show active queue card if the customer is currently waiting
- Show upcoming appointment card if a scheduled visit exists
- Show suggested nearby businesses
- Show latest notifications

### 14.2 Discovery and maps

- Request location permission with clear value explanation
- Display businesses on map and as cards
- Support list/map switching
- Show distance if location is available
- Show rating, category, and queue estimate on cards

### 14.3 Business detail

- Show live queue summary
- Show join queue CTA
- Show appointment booking CTA
- Show services, pricing, duration, and business details
- Show reviews summary when available

### 14.4 Queue join

- Require authenticated customer
- Confirm business and customer name before submission
- Show success state with immediate redirect into live tracker
- Prevent duplicate active joins for the same user if business logic requires it

### 14.5 Live queue tracker

- Show queue status: waiting, serving, completed, removed, cancelled
- Show position and estimated wait
- Show last updated time
- Allow leaving the queue while active
- Promote notifications when status changes from waiting to serving

### 14.6 Appointments

- Support date/time selection
- Only allow future booking
- Enforce business open hours
- Show statuses: pending, confirmed, completed, cancelled
- Allow early-arrival request for same-day confirmed appointments

### 14.7 Notifications

- Display latest 50 in-app notifications initially, matching current backend behavior
- Support mark all as read
- Support deep links into queue, appointment, or business screens

### 14.8 Reviews

- Allow 1 to 5 star rating
- Allow optional comment
- Allow update of previous review

## 15. Push Notification Requirements

Push is one of the biggest reasons to build mobile. MVP should include:

- Queue joined confirmation
- Queue status changed to serving
- Queue position nearly up
- Appointment booked
- Appointment confirmed
- Appointment cancelled
- Early-arrival response if added later

Important note: the current web app appears to rely mostly on polling every 10 seconds for live updates. Mobile should not depend on polling alone for critical alerts.

## 16. Backend and Platform Requirements

The current backend can support much of the mobile customer MVP, but mobile readiness will improve significantly with the following additions or refinements:

- Push notification infrastructure
- More explicit device/session management
- Stable mobile auth token strategy
- API responses designed for mobile-friendly summaries
- Better queue event signaling instead of polling-only refresh
- Clear prevention rules for duplicate queue joins or double bookings
- Versioned API contracts if mobile and web evolve independently

### Recommended backend changes before or during mobile MVP

- Add mobile push token registration endpoints
- Add notification event triggers for queue progression and appointment state changes
- Add a compact customer home endpoint aggregating active queue, next appointment, and notifications
- Add stronger queue position fields or computed response data
- Audit queue schema consistency, because some code paths reference fields like `position` and `estimatedWaitTime` while the current model centers on `sortOrder` and `estimatedServiceTime`
- Audit real-time architecture, because Socket.IO is listed in dependencies but the current customer and business pages visibly use polling

## 17. Analytics and Success Metrics

### North star metric

- Monthly active customers who complete a queue join or appointment action in mobile

### Core product metrics

- Queue joins per active customer
- Appointment bookings per active customer
- Queue completion rate
- Appointment show-up rate
- Review submission rate after completed service
- 7-day and 30-day customer retention
- Push open rate for queue and appointment alerts

### Business metrics

- Number of businesses with at least one mobile-originated customer action
- Business response time to early-arrival and queue events

## 18. Risks and Open Issues

### Product risks

- If live updates are slow or unreliable, mobile trust will drop quickly
- If push notifications are missing, the mobile value proposition weakens
- If queue estimates are inaccurate, customers may arrive too late or too early

### Technical risks

- Existing queue logic appears to use mixed concepts across model and route code
- Some time handling is being corrected in UI logic today, which should be standardized for mobile
- Notification volume and event timing may need refinement before launch

### Operational risks

- Businesses may need training if phase 2 includes operational queue controls
- Moderation and review handling may need stronger policy support over time

## 19. Phased Rollout Plan

### Phase 0: Mobile readiness

- Stabilize auth flows for mobile
- Add push infrastructure
- Resolve queue schema inconsistencies
- Add aggregate mobile endpoints
- Confirm analytics instrumentation

### Phase 1: Customer MVP

- Auth
- Discovery
- Business detail
- Join queue
- Live queue tracker
- Appointment booking and tracking
- Notifications
- Reviews

### Phase 2: Business companion

- Queue operations
- Appointment operations
- Early-arrival handling
- Notifications

### Phase 3: Optimization

- Smarter arrival predictions
- Personalized discovery
- Better wait-time estimation
- Loyalty and repeat-booking features

## 20. Recommended Build Approach

Recommended product approach:

- Build the mobile app primarily for customers first
- Keep business functionality intentionally lightweight in the first business mobile release
- Keep admin on web

Recommended technical approach:

- Reuse the existing API and role model where possible
- Introduce mobile-specific aggregate endpoints instead of copying web page fetch patterns directly
- Treat push notifications and real-time status reliability as launch-critical, not optional polish

## 21. Definition of MVP Success

The customer MVP is successful if:

- Customers can reliably discover businesses, join queues, and book appointments from mobile
- Customers receive timely updates without needing to constantly reopen the app
- Queue tracking becomes a repeat behavior, not a one-time novelty
- Businesses see measurable customer usage without needing operational changes first

## 22. Final Recommendation

LiveQ is a good fit for mobile, especially on the customer side. The current product already contains the right core behaviors. The mobile opportunity is not to invent a new product, but to make the existing product faster, more timely, and more dependable in real-world movement and waiting scenarios.

If only one thing is prioritized before development starts, it should be real-time and push notification reliability. That is the difference between a mobile app that feels essential and one that feels like a wrapped website.
