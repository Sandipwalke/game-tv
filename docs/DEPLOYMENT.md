# Final Deployment Guide (Render + Docker + Postgres)

## Goal

Once you connect this Git repo to Render, deployment should run automatically with minimal manual setup.

## 1) Connect repository to Render

1. In Render dashboard, click **New +** → **Blueprint**.
2. Select this repository.
3. Render will detect `render.yaml` and propose:
   - Web service: `town-sim`
   - Database: `town-sim-db`
4. Approve and create.

## 2) What auto-configures via `render.yaml`

- Docker runtime build for web app
- Managed Postgres database
- `DATABASE_URL` injected from database into web service
- Health check at `/healthz`
- Auto-deploy enabled on new commits

## 3) One-time checks after first deploy

- Open service URL and verify app loads.
- Verify API health:
  - `GET https://<service-url>/healthz`
- Verify world payload:
  - `GET https://<service-url>/api/world`

## 4) Environment variables

Default variables are provided by blueprint:

- `DATABASE_URL` (from Render Postgres)
- `DATABASE_SSL=require`
- `NODE_ENV=production`

Optional:

- `VITE_API_URL` (only needed if API is hosted separately)

## 5) How database schema is handled

On service startup, `server/index.ts` executes `server/sql/init.sql`:

- Creates all required tables (`locations`, `objects`, `interactions`, `users`)
- Creates indexes
- Seeds base world objects idempotently (`ON CONFLICT DO NOTHING`)

So first boot initializes DB automatically.

## 6) Git-driven automatic deploy flow

After blueprint setup, your ongoing workflow is:

1. Push to GitHub main branch
2. Render auto-builds Docker image
3. Render deploys new version automatically

No additional cloud setup is required for each deploy.
