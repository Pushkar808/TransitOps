# 🚛 TransitOps

## Smart Transport Operations Platform

TransitOps is an end-to-end fleet management and transport operations platform designed to digitize and automate logistics workflows.

The platform enables organizations to manage their complete transport lifecycle including vehicle registration, driver management, trip dispatching, maintenance tracking, fuel monitoring, expense management, and operational analytics from a centralized system.

TransitOps replaces traditional spreadsheet-based fleet operations with a smart, rule-driven system that improves efficiency, reduces operational errors, and provides real-time visibility.

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

## Problem Statement

Many logistics companies still depend on manual records and spreadsheets to manage their fleet operations. This creates several challenges:

* Vehicle scheduling conflicts
* Poor fleet utilization
* Lack of real-time visibility
* Expired driver licenses
* Missed maintenance schedules
* Incorrect expense tracking
* Difficulty in analyzing operational performance

TransitOps solves these challenges by introducing automation, validation rules, and intelligent operational insights.

## Objective

To build a centralized transport operations platform that helps fleet managers efficiently manage vehicles, drivers, trips, maintenance, expenses, and analytics while enforcing critical business rules automatically.

## Key Features

## 🔐 Authentication & Role-Based Access Control (RBAC)

Secure authentication system with role-based permissions.

Supported roles:

* Fleet Manager
* Driver
* Safety Officer
* Financial Analyst

Each user gets access according to their operational responsibilities.

## 🚚 Vehicle Management

Complete vehicle lifecycle management.

Features:

* Add and manage vehicles
* Track vehicle registration details
* Monitor load capacity
* Maintain odometer records
* Track acquisition cost
* Manage vehicle availability

Vehicle statuses:

* Available
* On Trip
* In Shop
* Retired

## 👨‍✈️ Driver Management

Manage driver information and compliance.

Features:

* Driver profile management
* License tracking
* License expiry monitoring
* Contact details
* Safety score tracking
* Driver availability status

The system automatically prevents assigning:

* Expired license drivers
* Suspended drivers
* Drivers already assigned to trips

## 📦 Smart Trip Management

Create and manage transportation trips with automated validation.

Trip lifecycle:

```
Draft
  ↓
Dispatched
  ↓
Completed
```

or

```
Dispatched
  ↓
Cancelled
```

The system automatically:

* Assigns available vehicles
* Assigns eligible drivers
* Validates cargo capacity
* Updates vehicle status
* Updates driver status

## 🔧 Maintenance Management

Track vehicle maintenance activities.

Features:

* Create maintenance records
* Track maintenance costs
* Automatically mark vehicles as "In Shop"
* Remove unavailable vehicles from dispatch selection
* Restore vehicle availability after maintenance completion

## ⛽ Fuel & Expense Management

Monitor all operational expenses.

Supported tracking:

* Fuel logs
* Fuel cost
* Fuel consumption
* Maintenance expenses
* Other operational expenses

Automatically calculates:

* Total operational cost
* Fuel efficiency
* Vehicle performance metrics

## 📊 Dashboard & Analytics

Real-time operational insights through an interactive dashboard.

Key metrics:

* Active Vehicles
* Available Vehicles
* Vehicles Under Maintenance
* Active Trips
* Pending Trips
* Drivers On Duty
* Fleet Utilization Percentage

Analytics include:

* Fuel Efficiency
* Operational Cost Analysis
* Vehicle ROI
* Fleet Performance Reports

## 🧠 Business Rule Engine

TransitOps includes automated business validation rules to prevent operational mistakes.

Implemented rules:

✅ Vehicle registration number must be unique

✅ Retired or maintenance vehicles cannot be dispatched

✅ Drivers with expired licenses cannot be assigned

✅ Suspended drivers cannot be assigned

✅ Vehicle capacity validation before dispatch

✅ Vehicle and driver cannot have multiple active trips

✅ Dispatch automatically changes vehicle and driver status to "On Trip"

✅ Trip completion restores vehicle and driver availability

✅ Maintenance automatically updates vehicle status

## 🏗️ System Architecture

```
                    Users
                      |
                      |
              Web Application
                      |
                      |
                 API Layer
                      |
                      |
            Business Rule Engine
                      |
                      |
                  Database Layer
                      |
       --------------------------------
       |          |          |         |
   Vehicles    Drivers    Trips   Expenses
       |
   Maintenance + Analytics
```

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
| Driver            | driver@transitops.com      | Driver@123  |
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
