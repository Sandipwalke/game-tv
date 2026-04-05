# 3D Town Simulation Platform

Production-ready browser platform for exploring an interactive Three.js-powered town with Cloudflare Worker APIs and D1 persistence.

## Stack

- Frontend: React + Vite + TypeScript (strict) + Tailwind CSS + Zustand + Three.js (`@react-three/fiber`)
- Backend: Cloudflare Workers + D1 (SQLite)
- Deployment: Cloudflare Pages + Worker + D1 migrations

## Project Structure

```txt
src/
  components/         HUD, loading overlay
  hooks/              API/world bootstrap hooks
  scene/              Three.js scene + controls + interaction logic
  store/              Zustand state container
  types/              shared TS models
  utils/              API helper and fallback town generator
worker/
  src/index.ts        Worker API
  migrations/         D1 schema + seed data
  wrangler.toml       Worker + D1 config
docs/
  DEPLOYMENT.md       Step-by-step deploy runbook
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Apply D1 migrations locally:
   ```bash
   npx wrangler d1 migrations apply town_sim --local --config worker/wrangler.toml
   ```
3. Run Worker API:
   ```bash
   npm run worker:dev
   ```
4. In another terminal, run frontend:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173`.

## Key Features

- Orbit and first-person camera modes
- Raycast-based object selection with info panel
- Dynamic day/night cycle and street light intensity changes
- Animated moving cars and instanced tree rendering
- Fallback procedural town generation if API is unavailable
- REST API endpoints:
  - `GET /world`
  - `GET /object/:id`
  - `POST /interaction`
  - `GET /assets`

## Performance Notes

- Instanced meshes for vegetation
- GPU-friendly capped pixel ratio (`<= 2`)
- Frustum culling enabled on repeated geometry
- Draco-ready GLTF loader + in-memory model cache for future external assets

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment on Cloudflare.
