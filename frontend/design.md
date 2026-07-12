# TransitOps — System Design

## 1. Overview

TransitOps is a fleet management and transport operations platform. It digitizes the
lifecycle of a logistics fleet — vehicles, drivers, trips, maintenance, fuel, and
expenses — and layers a rule engine on top so that invalid operational states
(dispatching a retired vehicle, assigning a suspended driver, overloading cargo, etc.)
are rejected at the API boundary rather than discovered later in a spreadsheet.

The system is a two-service monorepo:

- **backend** — Express.js REST API, JWT auth, Prisma ORM, PostgreSQL
- **frontend** — Next.js 15 (App Router) SPA-style dashboard, Tailwind + shadcn/ui, Recharts

Both services are containerized and composed together via Docker Compose, with
Postgres as the third component.

```
┌─────────────┐     HTTPS/JSON      ┌──────────────┐      SQL       ┌────────────┐
│  Next.js    │ ───────────────────▶│  Express API  │ ──────────────▶│ PostgreSQL │
│  Frontend   │◀─────────────────── │  (Prisma ORM) │◀────────────── │            │
└─────────────┘     JWT Bearer      └──────────────┘                 └────────────┘
     :3000                                :4000
```

## 2. Goals & Non-Goals

**Goals**
- Single source of truth for fleet state (vehicles, drivers, trips).
- Enforce business rules server-side so the frontend can't bypass them.
- Role-based access so each operational persona only sees/does what's relevant.
- Give managers real-time KPIs and per-vehicle profitability (ROI) without manual spreadsheet work.

**Non-goals (current version)**
- No GPS/live telematics ingestion — trip distance/odometer are entered manually on completion.
- No mobile app; the web dashboard is responsive but not a native client.
- No route optimization / AI features yet (see README's "Future Enhancements").

## 3. Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend    | Node.js, Express.js, Prisma ORM |
| Database   | PostgreSQL 16 |
| Auth       | JWT (Bearer access tokens) + bcrypt password hashing + RBAC middleware |
| Deployment | Docker + Docker Compose (3 services: db, backend, frontend) |
| Hardening  | helmet, cors allow-list, express-rate-limit (500 req / 15 min) |

## 4. Backend Architecture

The backend follows a conventional layered Express structure:

```
backend/src/
├── app.js              # middleware pipeline (helmet, cors, json, rate-limit, routes, error handlers)
├── index.js             # server bootstrap
├── config/              # env loading, Prisma client singleton
├── routes/               # one router per resource, wires middleware -> controller
├── controllers/           # request handling + business rules + Prisma calls
├── middleware/             # auth (JWT verify + RBAC), validation, error handling
├── services/                # email + scheduled license-expiry reminders
└── utils/                    # ApiError, asyncHandler, jwt helpers, zod-style validators
```

There is no separate service/repository layer — controllers call Prisma directly and
encapsulate business rules inline (e.g. `assertAssignable` in `trip.controller.js`).
For a project of this scope that keeps the code easy to follow; it's the main
candidate for refactoring if the domain logic grows (see §9).

### 4.1 Request pipeline

Every request passes through: `helmet` → `cors` → `express.json` → `morgan` (non-test)
→ rate limiter → `/api` router → resource router → `authenticate` → `authorize(roles)`
→ `validate(schema)` → controller → `errorHandler`.

### 4.2 API surface

| Resource | Base path | Notes |
|---|---|---|
| Auth | `/api/auth` | `register`, `login`, `me` |
| Vehicles | `/api/vehicles` | CRUD, `/dispatchable`, document attach/remove |
| Drivers | `/api/drivers` | CRUD, `/dispatchable` |
| Trips | `/api/trips` | create (DRAFT), `dispatch`, `complete`, `cancel` |
| Maintenance | `/api/maintenance` | open record, `close` |
| Finance | `/api/finance` | fuel logs, expenses |
| Dashboard | `/api/dashboard` | aggregated KPIs + chart data |
| Reports | `/api/reports` | per-vehicle analytics, CSV export |

### 4.3 Authentication & RBAC

- `POST /auth/login` issues a JWT (`sub` = user id) signed server-side; the frontend
  stores it in `localStorage` and sends it as `Authorization: Bearer <token>`.
- `authenticate` middleware verifies the token and re-fetches the user from the DB
  on every request (so a deleted/disabled user is rejected immediately, not just when
  the token expires).
- `authorize(...roles)` is a middleware factory: `ADMIN` always passes; other roles
  must be in the allow-list for that route. This is applied per-route, e.g. only
  `FLEET_MANAGER`/`SAFETY_OFFICER` can write drivers, only `FLEET_MANAGER` can open/close
  maintenance, only `FINANCIAL_ANALYST`/`FLEET_MANAGER` can log fuel/expenses.

Five roles: `ADMIN`, `FLEET_MANAGER`, `DRIVER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`.

### 4.4 Business rule engine

The core domain invariant is: **vehicle/driver status must always reflect reality**,
and the API must never let a write put the system into an inconsistent state. This is
enforced centrally in `trip.controller.js`'s `assertAssignable()` plus a few checks in
`maintenance.controller.js`:

- A vehicle that is `RETIRED` or `IN_SHOP` can never be dispatched.
- A vehicle/driver already `ON_TRIP` can't be assigned to a second trip.
- Cargo weight can't exceed the vehicle's `maxLoadKg`.
- A `SUSPENDED` driver, or one with an expired `licenseExpiry`, can't be assigned.
- Registration numbers and license numbers are unique at the DB level.
- A vehicle already on a trip can't be sent to maintenance; a retired vehicle can't
  either.
- Closing a maintenance record restores the vehicle to `AVAILABLE` — unless it was
  separately marked `RETIRED`, which takes precedence.

### 4.5 Trip state machine

```
        create()                dispatch()                complete()
DRAFT ─────────────▶ (validated) ─────────────▶ DISPATCHED ─────────────▶ COMPLETED
  │                                                  │
  │ cancel()                                         │ cancel()
  ▼                                                   ▼
CANCELLED ◀─────────────────────────────────────── CANCELLED
```

- `create` runs `assertAssignable` up front but doesn't touch vehicle/driver status yet
  — the trip starts as `DRAFT`.
- `dispatch` re-validates (state may have changed since creation) inside a
  `prisma.$transaction`, and atomically flips vehicle + driver to `ON_TRIP` and the
  trip to `DISPATCHED`.
- `complete` (only from `DISPATCHED`) atomically restores vehicle/driver to
  `AVAILABLE`, records `finalOdometer` on the vehicle, and writes a `FuelLog` entry if
  fuel was consumed.
- `cancel` is allowed from any non-terminal state; if the trip had been dispatched, it
  releases the vehicle/driver back to `AVAILABLE`.

Every multi-row mutation (dispatch, complete, cancel, maintenance open/close) is
wrapped in a Prisma transaction so the trip status and the vehicle/driver status can
never drift apart from a partial write.

### 4.6 Analytics & reporting

`report.controller.js` computes, per vehicle, on demand (no pre-aggregated table):

- **Fuel efficiency** = total distance of completed trips ÷ total fuel liters logged.
- **Operational cost** = fuel cost + maintenance cost + other expenses.
- **ROI** = (revenue − (maintenance cost + fuel cost)) ÷ acquisition cost.

Results are available as JSON (`/reports/vehicles`) or streamed as CSV
(`/reports/vehicles/export`). `dashboard.controller.js` separately computes fleet-wide
KPIs (counts by status, fleet utilization = on-trip vehicles ÷ non-retired vehicles)
using parallelized Prisma `count`/`groupBy` calls.

### 4.7 Background services

`licenseReminder.service.js` scans for driver licenses expiring within
`LICENSE_REMINDER_DAYS` (config via env, default 30) and uses `email.service.js` to
notify — turning a manual compliance check into an automated one.

## 5. Data Model

PostgreSQL via Prisma. Core entities and relationships:

```
User ──< Trip (createdBy)

Vehicle ──< Trip
Vehicle ──< MaintenanceLog
Vehicle ──< FuelLog
Vehicle ──< Expense
Vehicle ──< VehicleDocument

Driver ──< Trip
```

Key enums map 1:1 onto the state machines above: `VehicleStatus`
(AVAILABLE/ON_TRIP/IN_SHOP/RETIRED), `DriverStatus`
(AVAILABLE/ON_TRIP/OFF_DUTY/SUSPENDED), `TripStatus`
(DRAFT/DISPATCHED/COMPLETED/CANCELLED), `MaintenanceStatus` (OPEN/CLOSED),
`ExpenseType` (TOLL/FUEL/MAINTENANCE/OTHER), `Role` (the five RBAC roles).

Uniqueness constraints that back the rule engine: `Vehicle.registrationNo`,
`Driver.licenseNo`, `User.email`.

## 6. Frontend Architecture

```
frontend/src/
├── app/
│   ├── login/                # public route
│   └── (app)/                # authenticated route group, shared layout (sidebar + header)
│       ├── dashboard/
│       ├── vehicles/
│       ├── drivers/
│       ├── trips/
│       ├── maintenance/
│       ├── finance/
│       └── reports/
├── components/              # sidebar, header, page-header, theme toggle, shadcn/ui primitives
└── lib/
    ├── api.ts                # fetch wrapper: injects JWT, normalizes errors, CSV download helper
    ├── auth-context.tsx       # React context: current user, login/logout, hasRole()
    ├── types.ts                # TS types mirroring the Prisma schema / API responses
    ├── use-fetch.ts             # data-fetching hook used by the resource pages
    └── format.ts                 # display formatting helpers
```

- **Auth flow**: `AuthProvider` hydrates the current user from `/auth/me` using a token
  stored in `localStorage`; `login()` posts credentials, stores the returned JWT, and
  redirects to `/dashboard`. `hasRole()` is used by pages/components to conditionally
  render actions (e.g. hide "Add Vehicle" from non-managers) — this is a UX affordance
  only, since the backend independently enforces RBAC.
- **Data access**: `lib/api.ts` is a thin `fetch` wrapper — every call attaches the
  Bearer token, throws on non-2xx with the API's error message, and route pages use it
  via `use-fetch.ts` for loading/error state.
- **Layout**: the `(app)` route group centralizes the sidebar/header chrome and (by
  inference from the auth context) route protection for anything under it, while
  `/login` stays outside that group.

## 7. Deployment

`docker-compose.yml` defines three services:

| Service | Image / build | Port | Notes |
|---|---|---|---|
| `db` | `postgres:16-alpine` | 5432 | healthcheck-gated so backend waits for readiness |
| `backend` | `./backend/Dockerfile` | 4000 | env-configured `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `LICENSE_REMINDER_DAYS` |
| `frontend` | `./frontend/Dockerfile` | 3000 | `NEXT_PUBLIC_API_URL` baked in at build time as a Docker build arg |

`backend/docker-entrypoint.sh` is expected to run Prisma migrations/seed before
starting the API (standard pattern for this kind of setup). The default
`docker-compose.yml` values (Postgres password, `JWT_SECRET`) are placeholders and are
explicitly flagged for replacement in production.

## 8. Security Notes

- Passwords are hashed with bcrypt; nothing sensitive is stored in plaintext.
- `helmet` sets standard secure headers; `cors` is restricted to an explicit origin
  allow-list (`CORS_ORIGIN`) rather than `*`.
- Rate limiting is global (500 requests / 15 min per IP) — coarse, but enough to blunt
  basic abuse; it doesn't currently special-case the login endpoint for brute-force
  protection.
- JWTs are re-validated against the DB on every request rather than trusted purely on
  signature, so a removed user is rejected immediately rather than only at token
  expiry.
- The JWT is stored in `localStorage` on the frontend, which is simple but exposes it
  to any script-injection (XSS) vector; an httpOnly cookie would be a stronger option
  if this evolves past a hackathon/demo project.

## 9. Known Limitations / Future Work

These mirror the README's "Future Enhancements" list plus a few implementation notes
worth calling out for anyone extending the system:

- **No route/service layer** — controllers currently own both HTTP handling and domain
  rules. Fine at the current size; worth extracting into a services layer if more
  resources or more complex rules are added.
- **Manual trip metrics** — distance, odometer, and fuel consumption are entered by
  the user on trip completion rather than pulled from telematics/GPS.
- **Coarse rate limiting** — no per-route (e.g. per-login) throttling yet.
- **Planned**: AI-assisted route optimization, predictive maintenance, driver behavior
  scoring, automatic license-expiry notifications (partially implemented via
  `licenseReminder.service.js`), vehicle document management (basic version exists via
  `VehicleDocument`), a mobile app, and a richer reporting suite.
