export interface Env {
  DB: D1Database;
}

type WorldObject = {
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
  metadata: string | null;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });

async function getWorld(db: D1Database) {
  const { results } = await db
    .prepare(
      `SELECT id, name, type, model_url, position_x, position_y, position_z,
       rotation_x, rotation_y, rotation_z, scale_x, scale_y, scale_z, metadata
       FROM objects ORDER BY id ASC`,
    )
    .all<WorldObject>();

  return {
    worldName: 'Cloudflare Town',
    objects: results.map((object) => ({
      id: object.id,
      name: object.name,
      type: object.type,
      modelUrl: object.model_url ?? undefined,
      position: [object.position_x, object.position_y, object.position_z],
      rotation: [object.rotation_x, object.rotation_y, object.rotation_z],
      scale: [object.scale_x, object.scale_y, object.scale_z],
      metadata: object.metadata ? JSON.parse(object.metadata) : undefined,
    })),
  };
}

async function logInteraction(db: D1Database, body: string) {
  const payload = JSON.parse(body) as { objectId: string; actionType: string; occurredAt?: string; payload?: string };
  await db
    .prepare(
      'INSERT INTO interactions (object_id, action_type, payload, occurred_at) VALUES (?, ?, ?, ?)',
    )
    .bind(payload.objectId, payload.actionType, payload.payload ?? null, payload.occurredAt ?? new Date().toISOString())
    .run();

  return { ok: true };
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return json({ ok: true });
    }

    if (url.pathname === '/world' && request.method === 'GET') {
      return json(await getWorld(env.DB));
    }

    if (url.pathname.startsWith('/object/') && request.method === 'GET') {
      const id = url.pathname.split('/').at(-1);
      const result = await env.DB
        .prepare(
          `SELECT id, name, type, model_url, position_x, position_y, position_z,
                  rotation_x, rotation_y, rotation_z, scale_x, scale_y, scale_z, metadata
           FROM objects WHERE id = ?`,
        )
        .bind(id)
        .first<WorldObject>();

      if (!result) return json({ error: 'Object not found' }, 404);

      return json({
        id: result.id,
        name: result.name,
        type: result.type,
        modelUrl: result.model_url,
        position: [result.position_x, result.position_y, result.position_z],
        rotation: [result.rotation_x, result.rotation_y, result.rotation_z],
        scale: [result.scale_x, result.scale_y, result.scale_z],
        metadata: result.metadata ? JSON.parse(result.metadata) : undefined,
      });
    }

    if (url.pathname === '/interaction' && request.method === 'POST') {
      return json(await logInteraction(env.DB, await request.text()), 201);
    }

    if (url.pathname === '/assets' && request.method === 'GET') {
      const { results } = await env.DB
        .prepare('SELECT id, name, model_url FROM objects WHERE model_url IS NOT NULL ORDER BY id')
        .all<{ id: string; name: string; model_url: string }>();
      return json({ assets: results });
    }

    return json({ error: 'Not found' }, 404);
  },
} satisfies ExportedHandler<Env>;
