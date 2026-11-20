# Sky First

Rooftop restaurant web app: React (client) + Express/MongoDB (server).

## Architecture
- `client/` - Vite + React frontend
- `server/` - Express API (ESM), MongoDB via Mongoose
- `server/api/index.js` - Vercel serverless entrypoint
- Routes: health, menu, reservations, contact, auth, users, tables

## Default Users
- Admin: admin@skyfirst.ma / admin123
- Waiter: waiter@skyfirst.ma / waiter123

## Setup
```bash
cd server && npm install && cp .env.example .env
cd ../client && npm install
```
Set `MONGODB_URI`, `JWT_SECRET`, SMTP_* in `server/.env`.

## Run
```bash
cd server && npm run dev
cd client && npm run dev
```

## Deploy (server only on Vercel)
Root directory: `server`. Env vars required: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`.