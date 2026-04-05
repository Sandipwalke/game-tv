# Deployment Guide (Cloudflare Pages + Workers + D1)

## 1) Prerequisites

- Cloudflare account
- `npm i -g wrangler` or local `npx wrangler`
- Node.js 20+

## 2) Create D1 database

```bash
npx wrangler d1 create town_sim
```

Copy the resulting `database_id` into `worker/wrangler.toml`.

## 3) Apply migrations

```bash
npx wrangler d1 migrations apply town_sim --config worker/wrangler.toml
```

## 4) Deploy Worker API

```bash
npm run worker:deploy
```

After deploy, note Worker URL (example `https://town-sim-api.<subdomain>.workers.dev`).

## 5) Configure frontend environment

Set `VITE_API_URL` to your Worker URL in Cloudflare Pages environment variables.

Required variables:

- `VITE_API_URL`: Worker base URL

## 6) Deploy frontend to Cloudflare Pages

1. Push repository to GitHub/GitLab.
2. Create Cloudflare Pages project.
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add `VITE_API_URL` env var.
5. Deploy.

## 7) Optional R2 asset hosting

If hosting GLB textures/models in R2:

1. Create bucket:
   ```bash
   npx wrangler r2 bucket create town-assets
   ```
2. Upload assets to bucket.
3. Expose via public domain or signed URLs.
4. Store model URLs in `objects.model_url`.

## 8) Wrangler config example

`worker/wrangler.toml` is already scaffolded with:

- Worker entrypoint
- compatibility date
- D1 binding
- environment vars

## 9) Production checklist

- [ ] `database_id` replaced
- [ ] Migrations applied in production
- [ ] CORS policy tightened for your Pages domain
- [ ] Asset compression pipeline enabled (Draco/KTX2)
- [ ] Set up analytics and Worker logs
