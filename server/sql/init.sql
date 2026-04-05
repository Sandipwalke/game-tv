CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  position_x DOUBLE PRECISION NOT NULL,
  position_y DOUBLE PRECISION NOT NULL,
  position_z DOUBLE PRECISION NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS objects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  model_url TEXT,
  position_x DOUBLE PRECISION NOT NULL,
  position_y DOUBLE PRECISION NOT NULL,
  position_z DOUBLE PRECISION NOT NULL,
  rotation_x DOUBLE PRECISION NOT NULL,
  rotation_y DOUBLE PRECISION NOT NULL,
  rotation_z DOUBLE PRECISION NOT NULL,
  scale_x DOUBLE PRECISION NOT NULL,
  scale_y DOUBLE PRECISION NOT NULL,
  scale_z DOUBLE PRECISION NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interactions (
  id BIGSERIAL PRIMARY KEY,
  object_id TEXT NOT NULL REFERENCES objects(id),
  action_type TEXT NOT NULL,
  payload JSONB,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_objects_type ON objects(type);
CREATE INDEX IF NOT EXISTS idx_interactions_object_id ON interactions(object_id);

INSERT INTO objects
(id, name, type, model_url, position_x, position_y, position_z, rotation_x, rotation_y, rotation_z, scale_x, scale_y, scale_z, metadata)
VALUES
('building-civic-1', 'Civic Center', 'building', NULL, 0, 12, 0, 0, 0, 0, 16, 24, 16, '{"category":"government","occupancy":180}'),
('road-main-1', 'Main Avenue', 'road', NULL, 0, 0.01, 0, 0, 0, 0, 180, 0.1, 5, '{"lanes":4}'),
('vehicle-taxi-1', 'Downtown Taxi', 'vehicle', NULL, 12, 0.8, 8, 0, 0, 0, 2.3, 1.3, 4.1, '{"speed":12}'),
('tree-square-1', 'Square Tree', 'tree', NULL, -10, 1.2, 6, 0, 0, 0, 1, 1, 1, '{"species":"oak"}'),
('light-1', 'Street Light 1', 'light', NULL, 10, 4, 10, 0, 0, 0, 1, 1, 1, '{"autoNight":true}')
ON CONFLICT (id) DO NOTHING;
