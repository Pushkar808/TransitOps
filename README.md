# TransitOps — Smart Transport Operations Platform

A centralized, full-stack platform to manage the complete lifecycle of transport
operations: vehicles, drivers, dispatching, maintenance, fuel/expense logging and
analytics — with authentication, RBAC and automatic business-rule enforcement.

## Monorepo Structure

```
TransitOps/
├── backend/          # Express.js REST API (JWT + RBAC + Prisma + PostgreSQL)
├── frontend/         # Next.js 15 App Router (Tailwind + shadcn/ui + Recharts)
├── docker-compose.yml
└── README.md
```

## Tech Stack

| Layer     | Technology                                             |
|-----------|--------------------------------------------------------|
| Frontend  | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend   | Node.js, Express.js, Prisma ORM                        |
| Database  | PostgreSQL                                             |
| Auth      | JWT (access tokens) + bcrypt + Role-Based Access Control |
| Deploy    | Docker + Docker Compose                                |

## Roles (RBAC)

- **FLEET_MANAGER** – fleet assets, maintenance, vehicle lifecycle.
- **DRIVER** – creates trips, assigns vehicles/drivers, monitors deliveries.
- **SAFETY_OFFICER** – driver compliance, license validity, safety scores.
- **FINANCIAL_ANALYST** – expenses, fuel, maintenance costs, profitability.
- **ADMIN** – full access (super user).

## Quick Start (Docker — recommended)

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:4000
- Postgres → localhost:5432

The backend automatically runs migrations and seeds demo data on first boot.

### Demo Credentials

| Role              | Email                     | Password    |
|-------------------|---------------------------|-------------|
| Admin             | admin@transitops.com      | Admin@123   |
| Fleet Manager     | fleet@transitops.com      | Fleet@123   |
| Driver            | driver@transitops.com     | Driver@123  |
| Safety Officer    | safety@transitops.com     | Safety@123  |
| Financial Analyst | finance@transitops.com    | Finance@123 |

## Local Development (without Docker)

### Backend
```bash
cd backend
cp .env.example .env      # adjust DATABASE_URL to your local Postgres
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Feature Coverage

- ✅ Auth with JWT + RBAC
- ✅ Dashboard with KPIs + charts
- ✅ Vehicle Registry CRUD
- ✅ Driver Management CRUD
- ✅ Trip Management with all validations
- ✅ Automatic status transitions
- ✅ Maintenance workflow (auto In Shop)
- ✅ Fuel & Expense tracking
- ✅ Reports & Analytics (Fuel Efficiency, Utilization, Cost, ROI)
- ✅ CSV export
- ✅ Dark mode
- ✅ Search, filters & sorting
- ✅ License-expiry email reminders (scheduled job)
- ✅ Responsive UI
