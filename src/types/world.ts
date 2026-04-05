export type Vec3 = [number, number, number];

export interface WorldObject {
  id: string;
  name: string;
  type: 'building' | 'road' | 'vehicle' | 'tree' | 'light' | 'bench';
  modelUrl?: string;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  metadata?: Record<string, unknown>;
}

export interface WorldPayload {
  worldName: string;
  objects: WorldObject[];
}
