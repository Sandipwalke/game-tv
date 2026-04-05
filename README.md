# 3D Town Simulation Platform (Render + Docker)

Production-ready browser platform for exploring an interactive Three.js-powered town with a Dockerized Node API and PostgreSQL, deployable automatically on Render from your Git repository.

## Stack

- Frontend: React + Vite + TypeScript (strict) + Tailwind CSS + Zustand + Three.js (`@react-three/fiber`)
- Backend: Node.js + Express + PostgreSQL (`pg`)
- Deployment: Docker + Render Web Service + Render Postgres (`render.yaml` blueprint)

## Project Structure

```txt
src/
  components/         HUD, loading overlay
  hooks/              API/world bootstrap hooks
  scene/              Three.js scene + controls + interaction logic
  store/              Zustand state container
  types/              shared TS models
  utils/              API helper and fallback town generator
server/
  index.ts            Express API + static hosting
  sql/init.sql        PostgreSQL schema + idempotent seed
render.yaml           Render one-click blueprint (web + postgres)
Dockerfile            Container build/runtime definition
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start frontend dev server:
   ```bash
   npm run dev
   ```
3. Start API server in watch mode (requires `DATABASE_URL`):
   ```bash
   npm run server:dev
   ```

Frontend defaults to `/api`; set `VITE_API_URL` if you run API on a different host.

## API Endpoints

- `GET /api/world`
- `GET /api/object/:id`
- `POST /api/interaction`
- `GET /api/assets`
- `GET /healthz`

## Render Auto-Deploy

This repo now includes `render.yaml` so connecting the repository in Render can auto-provision:

- `town-sim` web service (Docker)
- `town-sim-db` PostgreSQL database
- `DATABASE_URL` wiring from DB to app

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for final setup checklist.
