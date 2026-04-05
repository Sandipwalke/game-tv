INSERT OR REPLACE INTO objects
(id, name, type, model_url, position_x, position_y, position_z, rotation_x, rotation_y, rotation_z, scale_x, scale_y, scale_z, metadata)
VALUES
('building-civic-1', 'Civic Center', 'building', NULL, 0, 12, 0, 0, 0, 0, 16, 24, 16, '{"category":"government","occupancy":180}'),
('road-main-1', 'Main Avenue', 'road', NULL, 0, 0.01, 0, 0, 0, 0, 180, 0.1, 5, '{"lanes":4}'),
('vehicle-taxi-1', 'Downtown Taxi', 'vehicle', NULL, 12, 0.8, 8, 0, 0, 0, 2.3, 1.3, 4.1, '{"speed":12}'),
('tree-square-1', 'Square Tree', 'tree', NULL, -10, 1.2, 6, 0, 0, 0, 1, 1, 1, '{"species":"oak"}'),
('light-1', 'Street Light 1', 'light', NULL, 10, 4, 10, 0, 0, 0, 1, 1, 1, '{"autoNight":true}');
