import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

type DbObject = {
  id: string;
  name: string;
  type: string;
  model_url: string | null;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  scale_x: number;
  scale_y: number;
  scale_z: number;
  metadata: unknown | null;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT ?? 3000);
const databaseUrl = process.env.DATABASE_URL;

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: false },
    })
  : null;

type WorldObject = {
  id: string;
  name: string;
  type: string;
  modelUrl?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  metadata?: unknown;
};

type WorldPayload = {
  worldName: string;
  objects: WorldObject[];
};

app.use(express.json({ limit: '1mb' }));

async function runInitSql(): Promise<boolean> {
  if (!pool) {
    console.warn('DATABASE_URL is not set. Starting in fallback mode without PostgreSQL.');
    return false;
  }

  const sqlPath = path.join(__dirname, 'sql', 'init.sql');
  const sql = await fs.readFile(sqlPath, 'utf-8');
  await pool.query(sql);
  return true;
}

async function loadFallbackWorld(): Promise<WorldPayload> {
  const registryPath = path.resolve(__dirname, '../public/assets/registry.json');
  const fallbackObject: WorldObject = {
    id: 'fallback-town-hall',
    name: 'Town Hall',
    type: 'building',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };

  try {
    const registryRaw = await fs.readFile(registryPath, 'utf-8');
    const parsed = JSON.parse(registryRaw) as { assets?: Array<{ id: string; label?: string; url?: string }> };
    const objects = (parsed.assets ?? []).map((asset, index) => ({
      id: asset.id || `fallback-object-${index + 1}`,
      name: asset.label ?? asset.id ?? `Object ${index + 1}`,
      type: 'asset',
      modelUrl: asset.url,
      position: [index * 4, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
    }));

    return {
      worldName: 'Render Town (Fallback)',
      objects: objects.length > 0 ? objects : [fallbackObject],
    };
  } catch (error) {
    console.warn('Failed to load fallback registry.json, using minimal world.', error);
    return {
      worldName: 'Render Town (Fallback)',
      objects: [fallbackObject],
    };
  }
}

app.get('/healthz', (_, res) => {
  res.json({ ok: true });
});

app.get('/api/world', async (_, res) => {
  if (!pool) {
    const fallbackWorld = await loadFallbackWorld();
    res.json(fallbackWorld);
    return;
  }

  const { rows } = await pool.query<DbObject>(
    `SELECT id, name, type, model_url, position_x, position_y, position_z,
            rotation_x, rotation_y, rotation_z, scale_x, scale_y, scale_z, metadata
     FROM objects
     ORDER BY id ASC`,
  );

  res.json({
    worldName: 'Render Town',
    objects: rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      modelUrl: row.model_url ?? undefined,
      position: [row.position_x, row.position_y, row.position_z],
      rotation: [row.rotation_x, row.rotation_y, row.rotation_z],
      scale: [row.scale_x, row.scale_y, row.scale_z],
      metadata: row.metadata ?? undefined,
    })),
  });
});

app.get('/api/object/:id', async (req, res) => {
  if (!pool) {
    const fallbackWorld = await loadFallbackWorld();
    const object = fallbackWorld.objects.find((entry) => entry.id === req.params.id);
    if (!object) {
      res.status(404).json({ error: 'Object not found' });
      return;
    }

    res.json(object);
    return;
  }

  const { rows } = await pool.query<DbObject>(
    `SELECT id, name, type, model_url, position_x, position_y, position_z,
            rotation_x, rotation_y, rotation_z, scale_x, scale_y, scale_z, metadata
      FROM objects WHERE id = $1 LIMIT 1`,
    [req.params.id],
  );

  const row = rows[0];
  if (!row) {
    res.status(404).json({ error: 'Object not found' });
    return;
  }

  res.json({
    id: row.id,
    name: row.name,
    type: row.type,
    modelUrl: row.model_url ?? undefined,
    position: [row.position_x, row.position_y, row.position_z],
    rotation: [row.rotation_x, row.rotation_y, row.rotation_z],
    scale: [row.scale_x, row.scale_y, row.scale_z],
    metadata: row.metadata ?? undefined,
  });
});

app.post('/api/interaction', async (req, res) => {
  const { objectId, actionType, payload, occurredAt } = req.body as {
    objectId?: string;
    actionType?: string;
    payload?: Record<string, unknown>;
    occurredAt?: string;
  };

  if (!objectId || !actionType) {
    res.status(400).json({ error: 'objectId and actionType are required' });
    return;
  }

  if (!pool) {
    res.status(202).json({ ok: true, mode: 'fallback', persisted: false });
    return;
  }

  await pool.query(
    `INSERT INTO interactions (object_id, action_type, payload, occurred_at)
     VALUES ($1, $2, $3, $4)`,
    [objectId, actionType, payload ?? null, occurredAt ?? new Date().toISOString()],
  );

  res.status(201).json({ ok: true });
});

app.get('/api/assets', async (_, res) => {
  if (!pool) {
    const fallbackWorld = await loadFallbackWorld();
    const assets = fallbackWorld.objects
      .filter((entry) => Boolean(entry.modelUrl))
      .map((entry) => ({ id: entry.id, name: entry.name, model_url: entry.modelUrl! }));
    res.json({ assets });
    return;
  }

  const { rows } = await pool.query<{ id: string; name: string; model_url: string }>(
    'SELECT id, name, model_url FROM objects WHERE model_url IS NOT NULL ORDER BY id',
  );
  res.json({ assets: rows });
});

const staticDir = path.resolve(__dirname, '../dist');
app.use(express.static(staticDir));
app.get('*', (_, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

runInitSql()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed during startup', error);
    process.exit(1);
  });
