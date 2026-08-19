# Sky First — Rooftop Restaurant & Café

Full-stack website for **Sky First**, an upscale rooftop restaurant and café at
**4 Av. de France, Agdal, Rabat**. Built with a mobile-first, dark glassmorphism
design with warm gold accents, it pairs a polished single-page React frontend
with a typed Express API for menus, table reservations, and contact messages.

## Features

- **Landing page** — Hero, live open/closed status, highlights marquee, menu,
  location with embedded map, Google reviews, contact section, and footer.
- **Menu browser** — Items organized by category (Breakfast, Main Courses,
  Desserts & Chocolate, Cold & Hot Beverages) with client-side filtering by
  category, search, vegetarian, and Chef's Special.
- **Multi-step reservation flow** — 4-step modal (date & time, guests, seating,
  details) backed by real-time slot availability, validation on every step, and
  an animated confirmation screen with a generated confirmation code.
- **Seating preferences** — Panoramic outdoor rooftop terrace, indoor lounge, or
  standard dining.
- **Contact form** — Zod-validated message submission via the API.
- **SEO ready** — Meta tags, OpenGraph, Twitter Card, and Schema.org
  `Restaurant` JSON-LD.
- **Business logic** — Enforces opening hours (07:00–23:00), rejects past dates,
  caps each 30-minute time slot at 6 simultaneous tables, and issues
  `SF-XXXXXX` confirmation codes.

## Tech Stack

| Layer      | Technology                                                              |
| ---------- | ----------------------------------------------------------------------- |
| Frontend   | React 18 + Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide icons  |
| Data/State | Axios, TanStack React Query, React Hook Form + Zod                      |
| Backend    | Node.js + Express (TypeScript), Helmet, CORS, Morgan                    |
| Data/State | In-memory mock database (no MongoDB required) — seeded on startup       |
| SEO        | Meta tags, OpenGraph, Twitter Card, Schema.org `Restaurant` JSON-LD     |

## Quick Start

Requires **Node.js 18+** only. No MongoDB or Docker needed — the server runs on an
in-memory database that is seeded with the menu automatically on startup.

```bash
# 1. Install all workspace dependencies
npm install

# 2. Run server (port 5000) + client (port 5173) together
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the Express
backend, so no CORS configuration is needed locally.

Workspaces can also be run independently:

```bash
npm run dev:server   # Express API only
npm run dev:client   # Vite dev server only
```

## API Endpoints

| Method | Endpoint                      | Description                                   |
| ------ | ----------------------------- | --------------------------------------------- |
| GET    | `/api/health`                 | Service status, business info, time slots     |
| GET    | `/api/menu`                   | Menu items (`?category=`, `?q=`, `?vegetarian=true`, `?special=true`) |
| GET    | `/api/menu/categories`        | Category counts                               |
| GET    | `/api/reservations/availability?date=YYYY-MM-DD` | Slot availability for a date       |
| POST   | `/api/reservations`           | Create reservation (Zod-validated)            |
| GET    | `/api/reservations`           | List reservations (`?date=`, `?status=`)      |
| POST   | `/api/contact`                | Submit a contact message                      |

All inputs are validated with **Zod**. `POST /api/reservations`:

- Enforces business hours (07:00–23:00) and rejects past dates.
- Caps each time slot at **6 simultaneous tables** (409 when full).
- Accepts 1–12 guests, name/phone/email validation, and optional special requests.
- Returns a `confirmationCode` (e.g. `SF-ABC123`) on success.

## Project Layout

```
client/                      React + Vite frontend
  src/components/            Sectional UI (Hero, Menu, Location, Reviews, Contact, Navbar, Footer…)
  src/components/reservation/  Multi-step booking modal + context
  src/components/Seo.tsx     Meta / OpenGraph / Twitter / JSON-LD tags
  src/data/business.ts       Brand constants (hours, rating, addresses, highlights)
  src/hooks/useMenu.ts       React Query hooks for menu data
  src/lib/api.ts             Typed Axios client
  src/types/                 Shared TypeScript types
server/                      Express backend (in-memory data store)
  src/config/                Env config + business constants
  src/db/                    In-memory store
  src/middleware/            Error handlers, validation, async wrapper
  src/models/                MenuItem, Reservation, Contact
  src/routes/                REST routes
  src/schemas/               Zod validation schemas
  src/seed/                  Menu seed data + runner
  src/utils/                 Time slots, confirmation codes, formatting
```

## Configuration

Copy `server/.env.example` to `server/.env` to override defaults:

```
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

`CLIENT_ORIGIN` restricts which origins may call the API (CORS). Use `*` during
development.

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Run server + client concurrently   |
| `npm run dev:server` | Run the Express API only           |
| `npm run dev:client` | Run the Vite dev server only       |
| `npm run build`      | Build both workspaces              |
| `npm run typecheck`  | Type-check both workspaces         |
| `npm run seed`       | Re-seed menu items into the store  |